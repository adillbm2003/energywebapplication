// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { validate, schemas } = require('../validate.cjs')

function runMiddleware(schema, body) {
  const req = { body }
  let statusCode = 200
  let payload = null
  let nextCalled = false
  const res = {
    status(code) { statusCode = code; return this },
    json(data) { payload = data; return this },
  }
  validate(schema)(req, res, () => { nextCalled = true })
  return { req, statusCode, payload, nextCalled }
}

describe('validate middleware', () => {
  it('calls next and replaces req.body with parsed data on success', () => {
    const r = runMiddleware(schemas.contact, {
      name: '  Jane Smith  ',
      email: 'jane@example.com',
      message: 'Hello',
    })
    expect(r.nextCalled).toBe(true)
    expect(r.req.body.name).toBe('Jane Smith')   // trimmed by the schema
    expect(r.req.body.subject).toBe('')          // default applied
  })

  it('rejects with 400 and the first issue message on failure', () => {
    const r = runMiddleware(schemas.contact, { name: '', email: 'nope', message: '' })
    expect(r.nextCalled).toBe(false)
    expect(r.statusCode).toBe(400)
    expect(r.payload.error).toBeTruthy()
    expect(Array.isArray(r.payload.details)).toBe(true)
  })
})

describe('user schemas', () => {
  it('accepts a valid new user', () => {
    const parsed = schemas.createUser.parse({
      username: 'jsmith',
      email: 'jsmith@gov.bm',
      password: 'a-strong-password',
      role: 'Editor',
    })
    expect(parsed.isActive).toBe(true)   // defaults to active
    expect(parsed.role).toBe('Editor')
  })

  it('rejects an unknown role', () => {
    const result = schemas.createUser.safeParse({
      username: 'jsmith',
      email: 'jsmith@gov.bm',
      password: 'a-strong-password',
      role: 'Superuser',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = schemas.createUser.safeParse({
      username: 'jsmith',
      email: 'jsmith@gov.bm',
      password: 'short',
      role: 'Viewer',
    })
    expect(result.success).toBe(false)
  })

  it('allows a partial update with no password', () => {
    const result = schemas.updateUser.safeParse({ role: 'Approver' })
    expect(result.success).toBe(true)
  })
})

describe('resetPassword schema', () => {
  it('requires a token and an 8+ character password', () => {
    expect(schemas.resetPassword.safeParse({ token: 'abc', newPassword: 'longenough' }).success).toBe(true)
    expect(schemas.resetPassword.safeParse({ token: '', newPassword: 'longenough' }).success).toBe(false)
    expect(schemas.resetPassword.safeParse({ token: 'abc', newPassword: 'tiny' }).success).toBe(false)
  })
})
