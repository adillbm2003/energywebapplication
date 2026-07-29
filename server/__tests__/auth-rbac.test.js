// @vitest-environment node
/**
 * Integration tests for authentication, RBAC and the generic collection engine.
 *
 * The database layer is mocked, so these run with no PostgreSQL instance. They
 * exercise the real Express app: importing server.cjs no longer starts a
 * listener (it binds a port only when run as `node server.cjs`).
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-not-used-in-production'

const db = require('../../db.cjs')
const jwt = require('jsonwebtoken')
const request = require('supertest')

// Route table metadata is loaded at boot from information_schema; stub the query
// used for that plus whatever each test needs.
let queryHandler

beforeAll(() => {
  vi.spyOn(db, 'query').mockImplementation((text, params) => queryHandler(text, params))
  vi.spyOn(db, 'executeTransaction').mockImplementation(async (cb) =>
    cb({ query: (text, params) => queryHandler(text, params) })
  )
})

const { app } = require('../../server.cjs')

const USERS = {
  admin:    { id: 'u-admin', username: 'admin', email: 'a@gov.bm', role: 'Administrator', is_active: true },
  approver: { id: 'u-appr',  username: 'appr',  email: 'p@gov.bm', role: 'Approver',      is_active: true },
  editor:   { id: 'u-edit',  username: 'edit',  email: 'e@gov.bm', role: 'Editor',        is_active: true },
  viewer:   { id: 'u-view',  username: 'view',  email: 'v@gov.bm', role: 'Viewer',        is_active: true },
  disabled: { id: 'u-off',   username: 'off',   email: 'o@gov.bm', role: 'Administrator', is_active: false },
}

function tokenFor(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

function authed(req, user) {
  return req.set('Cookie', [`token=${tokenFor(user)}`])
}

/** Default handler: resolves the authenticate() user lookup, empty for everything else. */
function defaultQueries(lookup = USERS) {
  return (text, params) => {
    if (/FROM users WHERE id/i.test(text)) {
      const found = Object.values(lookup).find(u => u.id === params[0])
      return Promise.resolve({ rows: found ? [found] : [] })
    }
    return Promise.resolve({ rows: [] })
  }
}

beforeEach(() => {
  queryHandler = defaultQueries()
})

describe('authenticate', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ id: 'u-admin', role: 'Administrator' }, 'wrong-secret')
    const res = await request(app).get('/api/auth/me').set('Cookie', [`token=${forged}`])
    expect(res.status).toBe(401)
  })

  it('rejects a valid token whose user no longer exists', async () => {
    const ghost = { id: 'u-gone', username: 'gone', role: 'Administrator' }
    const res = await authed(request(app).get('/api/auth/me'), ghost)
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('rejects a deactivated account even with a valid token', async () => {
    const res = await authed(request(app).get('/api/auth/me'), USERS.disabled)
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/inactive/i)
  })

  it('fails closed with 503 when the database is unreachable', async () => {
    // Regression guard: this path once trusted the JWT claims and let a DB
    // outage become an authentication bypass.
    queryHandler = () => Promise.reject(new Error('connection refused'))
    const res = await authed(request(app).get('/api/auth/me'), USERS.admin)
    expect(res.status).toBe(503)
  })

  it('accepts a valid token for an active user and echoes the role', async () => {
    const res = await authed(request(app).get('/api/auth/me'), USERS.editor)
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('Editor')
  })

  it('accepts a Bearer token as well as a cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenFor(USERS.viewer)}`)
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('Viewer')
  })
})

describe('login', () => {
  it('fails closed with 503 rather than falling back to a demo admin', async () => {
    // Regression guard: a DB error once authenticated anyone as Administrator.
    queryHandler = () => Promise.reject(new Error('connection refused'))
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'energy@gov.bm', password: 'bermuda2026' })
    expect(res.status).toBe(503)
    expect(res.body.token).toBeUndefined()
  })

  it('does not return the JWT in the response body', async () => {
    const bcrypt = require('bcryptjs')
    queryHandler = (text) => {
      if (/FROM users WHERE email/i.test(text)) {
        return Promise.resolve({ rows: [{
          ...USERS.admin,
          password_hash: bcrypt.hashSync('correct-horse', 10),
        }] })
      }
      return Promise.resolve({ rows: [] })
    }
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@gov.bm', password: 'correct-horse' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeUndefined()
    expect(res.body.user.role).toBe('Administrator')
    // ...it is delivered as an httpOnly cookie instead.
    const cookie = res.headers['set-cookie'].join(';')
    expect(cookie).toMatch(/token=/)
    expect(cookie).toMatch(/HttpOnly/i)
  })

  it('rejects a wrong password with a generic message', async () => {
    const bcrypt = require('bcryptjs')
    queryHandler = (text) => {
      if (/FROM users WHERE email/i.test(text)) {
        return Promise.resolve({ rows: [{ ...USERS.admin, password_hash: bcrypt.hashSync('right', 10) }] })
      }
      return Promise.resolve({ rows: [] })
    }
    const res = await request(app).post('/api/auth/login').send({ email: 'a@gov.bm', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid email or password')
  })
})

describe('authorize — Administrator-only routes', () => {
  const adminRoutes = [
    ['get', '/api/users'],
    ['get', '/api/logs'],
    ['get', '/api/recycleBin'],
  ]

  for (const [method, route] of adminRoutes) {
    it(`${route} rejects a Viewer with 403`, async () => {
      const res = await authed(request(app)[method](route), USERS.viewer)
      expect(res.status).toBe(403)
    })

    it(`${route} rejects an Editor with 403`, async () => {
      const res = await authed(request(app)[method](route), USERS.editor)
      expect(res.status).toBe(403)
    })

    it(`${route} allows an Administrator`, async () => {
      const res = await authed(request(app)[method](route), USERS.admin)
      expect(res.status).toBe(200)
    })
  }
})

describe('user management', () => {
  it('refuses to demote the last active administrator', async () => {
    queryHandler = (text, params) => {
      if (/FROM users WHERE id/i.test(text)) {
        const found = Object.values(USERS).find(u => u.id === params[0])
        return Promise.resolve({ rows: found ? [found] : [] })
      }
      if (/COUNT\(\*\).*Administrator/is.test(text)) {
        return Promise.resolve({ rows: [{ count: 0 }] })   // no other admins
      }
      return Promise.resolve({ rows: [] })
    }
    const res = await authed(
      request(app).put('/api/users/u-admin').send({ role: 'Viewer' }),
      USERS.admin
    )
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/last active administrator/i)
  })

  it('refuses to delete your own account', async () => {
    const res = await authed(request(app).delete('/api/users/u-admin'), USERS.admin)
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/your own account/i)
  })

  it('rejects an invalid role at the schema boundary', async () => {
    const res = await authed(
      request(app).post('/api/users').send({
        username: 'x', email: 'x@gov.bm', password: 'longenough1', role: 'Root',
      }),
      USERS.admin
    )
    expect(res.status).toBe(400)
  })
})

describe('collection write permissions', () => {
  it('blocks a Viewer from creating content', async () => {
    const res = await authed(request(app).post('/api/news').send({ title: 'x' }), USERS.viewer)
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/Viewer role/i)
  })

  it('blocks an Editor from creating content with a Published status', async () => {
    const res = await authed(
      request(app).post('/api/news').send({ title: 'x', status: 'Published' }),
      USERS.editor
    )
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/cannot publish/i)
  })

  it('blocks an Editor from editing an already-published item', async () => {
    // Defence in depth: the status is omitted from the body, so only the
    // stored status can reveal that this item is live.
    queryHandler = (text, params) => {
      if (/FROM users WHERE id/i.test(text)) {
        const found = Object.values(USERS).find(u => u.id === params[0])
        return Promise.resolve({ rows: found ? [found] : [] })
      }
      if (/SELECT \* FROM news WHERE id/i.test(text)) {
        return Promise.resolve({ rows: [{ id: 'n-1', title: 'Live', status: 'Published' }] })
      }
      return Promise.resolve({ rows: [{ count: 0 }] })
    }
    const res = await authed(
      request(app).put('/api/news/n-1').send({ title: 'Edited' }),
      USERS.editor
    )
    expect(res.status).toBe(403)
  })

  it('blocks a non-Administrator from deleting content', async () => {
    const res = await authed(request(app).delete('/api/news/n-1'), USERS.approver)
    expect(res.status).toBe(403)
  })
})

describe('public feed exposure', () => {
  it('filters non-public statuses for anonymous callers', async () => {
    let capturedSql = ''
    queryHandler = (text) => {
      if (/FROM news/i.test(text)) capturedSql = text
      return Promise.resolve({ rows: [] })
    }
    const res = await request(app).get('/api/news')
    expect(res.status).toBe(200)
    expect(capturedSql).toMatch(/status NOT IN/i)
  })

  it('does not filter for authenticated staff', async () => {
    let capturedSql = ''
    queryHandler = (text, params) => {
      if (/FROM users WHERE id/i.test(text)) {
        const found = Object.values(USERS).find(u => u.id === params[0])
        return Promise.resolve({ rows: found ? [found] : [] })
      }
      if (/FROM news/i.test(text)) capturedSql = text
      return Promise.resolve({ rows: [] })
    }
    const res = await authed(request(app).get('/api/news'), USERS.editor)
    expect(res.status).toBe(200)
    expect(capturedSql).not.toMatch(/status NOT IN/i)
  })
})

describe('GET /api/db', () => {
  it('withholds logs, versions and the recycle bin from non-administrators', async () => {
    const res = await authed(request(app).get('/api/db'), USERS.viewer)
    expect(res.status).toBe(200)
    expect(res.body.logs).toBeUndefined()
    expect(res.body.versions).toBeUndefined()
    expect(res.body.recycleBin).toBeUndefined()
    expect(res.body.news).toBeDefined()
  })

  it('includes them for an administrator', async () => {
    const res = await authed(request(app).get('/api/db'), USERS.admin)
    expect(res.status).toBe(200)
    expect(res.body.logs).toBeDefined()
    expect(res.body.versions).toBeDefined()
    expect(res.body.recycleBin).toBeDefined()
  })
})
