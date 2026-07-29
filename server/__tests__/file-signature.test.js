// @vitest-environment node
/**
 * The upload endpoint used to "verify" file types by reading req.file.mimetype —
 * the browser-supplied Content-Type header, which an attacker fully controls.
 * These tests cover the replacement, which inspects the file's own leading bytes.
 */
import { describe, it, expect, afterAll } from 'vitest'
import { createRequire } from 'module'
import fs from 'fs'
import os from 'os'
import path from 'path'

const require = createRequire(import.meta.url)

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-not-used-in-production'

const { verifyFileSignature } = require('../../server.cjs')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sigtest-'))
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }))

function write(name, bytes) {
  const p = path.join(tmpDir, name)
  fs.writeFileSync(p, Buffer.from(bytes))
  return p
}

const PNG_MAGIC  = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]
const JPEG_MAGIC = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]
const GIF_MAGIC  = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00]
const PDF_MAGIC  = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]
const ZIP_MAGIC  = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]
const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]

describe('verifyFileSignature — genuine files pass', () => {
  const cases = [
    ['png', PNG_MAGIC], ['jpg', JPEG_MAGIC], ['jpeg', JPEG_MAGIC],
    ['gif', GIF_MAGIC], ['pdf', PDF_MAGIC],
    ['docx', ZIP_MAGIC], ['xlsx', ZIP_MAGIC],
    ['xls', OLE2_MAGIC], ['doc', OLE2_MAGIC],
  ]
  for (const [ext, magic] of cases) {
    it(`accepts a real .${ext}`, () => {
      expect(verifyFileSignature(write(`good.${ext}`, magic), ext)).toBeNull()
    })
  }

  it('accepts a real WebP (RIFF….WEBP)', () => {
    const webp = [...Buffer.from('RIFF'), 0x24, 0, 0, 0, ...Buffer.from('WEBP'), 0, 0, 0, 0]
    expect(verifyFileSignature(write('good.webp', webp), 'webp')).toBeNull()
  })

  it('accepts a real MP4 (ftyp box)', () => {
    const mp4 = [0, 0, 0, 0x20, ...Buffer.from('ftyp'), ...Buffer.from('isom'), 0, 0, 0, 0]
    expect(verifyFileSignature(write('good.mp4', mp4), 'mp4')).toBeNull()
  })
})

describe('verifyFileSignature — spoofed files are rejected', () => {
  it('rejects an HTML/script payload renamed to .png', () => {
    const html = [...Buffer.from('<script>alert(1)</script>')]
    expect(verifyFileSignature(write('evil.png', html), 'png')).toMatch(/do not match/)
  })

  it('rejects a PDF renamed to .jpg', () => {
    expect(verifyFileSignature(write('mislabelled.jpg', PDF_MAGIC), 'jpg')).toMatch(/do not match/)
  })

  it('rejects an executable renamed to .pdf', () => {
    const mz = [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]
    expect(verifyFileSignature(write('evil.pdf', mz), 'pdf')).toMatch(/do not match/)
  })

  it('rejects a truncated file too short to carry the signature', () => {
    expect(verifyFileSignature(write('tiny.png', [0x89]), 'png')).toMatch(/do not match/)
  })

  it('rejects an empty file', () => {
    expect(verifyFileSignature(write('empty.png', []), 'png')).toMatch(/do not match/)
  })

  it('reports a readable reason when the file is missing', () => {
    expect(verifyFileSignature(path.join(tmpDir, 'nope.png'), 'png')).toMatch(/could not be read/)
  })
})

describe('verifyFileSignature — types with no reliable signature', () => {
  it('accepts extensions absent from the signature table', () => {
    // e.g. .csv/.txt carry no magic bytes; the extension allow-list governs them.
    expect(verifyFileSignature(write('data.csv', [...Buffer.from('a,b,c')]), 'csv')).toBeNull()
  })
})
