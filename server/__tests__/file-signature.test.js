// @vitest-environment node
/**
 * Upload validation.
 *
 * The endpoint originally "verified" file types by reading req.file.mimetype —
 * the browser-supplied Content-Type, which an attacker fully controls. That was
 * replaced with magic-byte inspection, but the first version demanded the
 * extension match the contents exactly, which rejected legitimate uploads (a
 * PNG saved as .jpg) with a security-sounding error.
 *
 * The rule these tests pin down: judge the file by what it actually contains.
 * Accept any permitted type and correct the extension; reject only content that
 * is not an allowed type at all.
 */
import { describe, it, expect, afterAll } from 'vitest'
import { createRequire } from 'module'
import fs from 'fs'
import os from 'os'
import path from 'path'

const require = createRequire(import.meta.url)

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-not-used-in-production'

const { inspectUpload, detectFileType } = require('../../server.cjs')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uploadtest-'))
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }))

function write(name, bytes) {
  const p = path.join(tmpDir, name)
  fs.writeFileSync(p, Buffer.from(bytes))
  return p
}

const ALLOWED = ['pdf', 'doc', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'webp', 'mp4', 'csv']

const PNG  = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]
const GIF  = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0]
const PDF  = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]
const ZIP  = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]
const OLE2 = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
const WEBP = [...Buffer.from('RIFF'), 0x24, 0, 0, 0, ...Buffer.from('WEBP'), 0, 0, 0, 0]
const MP4  = [0, 0, 0, 0x20, ...Buffer.from('ftyp'), ...Buffer.from('isom'), 0, 0, 0, 0]
const MZ   = [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]
const HTML = [...Buffer.from('<script>alert(1)</script>')]

describe('detectFileType', () => {
  const cases = [
    ['png', PNG], ['jpg', JPEG], ['gif', GIF], ['pdf', PDF],
    ['webp', WEBP], ['mp4', MP4],
  ]
  for (const [expected, bytes] of cases) {
    it(`identifies ${expected}`, () => {
      expect(detectFileType(Buffer.from(bytes))).toBe(expected)
    })
  }

  it('returns null for content with no known signature', () => {
    expect(detectFileType(Buffer.from(HTML))).toBeNull()
  })
})

describe('inspectUpload — correctly-named files pass unchanged', () => {
  it('accepts a real .png named .png', () => {
    const r = inspectUpload(write('a.png', PNG), 'png', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.corrected).toBe(false)
  })

  it('accepts a real .jpg named .jpg', () => {
    const r = inspectUpload(write('b.jpg', JPEG), 'jpg', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.corrected).toBe(false)
  })

  it('treats .jpeg and .jpg as the same type, not a mismatch', () => {
    const r = inspectUpload(write('c.jpeg', JPEG), 'jpeg', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.corrected).toBe(false)
  })

  it('accepts OOXML (zip-based) and legacy OLE2 documents', () => {
    expect(inspectUpload(write('d.xlsx', ZIP), 'xlsx', ALLOWED).ok).toBe(true)
    expect(inspectUpload(write('e.doc', OLE2), 'doc', ALLOWED).ok).toBe(true)
  })
})

describe('inspectUpload — mislabelled but safe files are accepted and corrected', () => {
  it('accepts a PNG saved as .jpg and reports the real type', () => {
    // This is the case that was wrongly rejected as a security failure.
    const r = inspectUpload(write('screenshot.jpg', PNG), 'jpg', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.type).toBe('png')
    expect(r.corrected).toBe(true)
  })

  it('accepts a WebP saved as .png', () => {
    const r = inspectUpload(write('f.png', WEBP), 'png', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.type).toBe('webp')
    expect(r.corrected).toBe(true)
  })

  it('accepts a JPEG saved as .png', () => {
    const r = inspectUpload(write('g.png', JPEG), 'png', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.type).toBe('jpg')
  })
})

describe('inspectUpload — dangerous or disallowed content is rejected', () => {
  it('rejects a Windows executable renamed to .jpg', () => {
    const r = inspectUpload(write('evil.jpg', MZ), 'jpg', ALLOWED)
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/does not appear to be a real/)
  })

  it('rejects an HTML/script payload renamed to .png', () => {
    const r = inspectUpload(write('evil.png', HTML), 'png', ALLOWED)
    expect(r.ok).toBe(false)
  })

  it('rejects a real type that is not on the allow-list', () => {
    const r = inspectUpload(write('h.png', GIF), 'png', ['png', 'jpg'])
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/actually a \.gif/)
  })

  it('rejects an empty file claiming to be an image', () => {
    const r = inspectUpload(write('empty.png', []), 'png', ALLOWED)
    expect(r.ok).toBe(false)
  })

  it('reports a readable reason when the file is missing', () => {
    const r = inspectUpload(path.join(tmpDir, 'nope.png'), 'png', ALLOWED)
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/could not be read/)
  })
})

describe('inspectUpload — formats with no reliable signature', () => {
  it('accepts a .csv on the strength of the allow-list alone', () => {
    const r = inspectUpload(write('data.csv', [...Buffer.from('a,b,c\n1,2,3')]), 'csv', ALLOWED)
    expect(r.ok).toBe(true)
    expect(r.type).toBeNull()
  })
})
