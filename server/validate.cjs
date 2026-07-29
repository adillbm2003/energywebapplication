/**
 * Zod-based request body validation middleware for Express.
 *
 * Usage:
 *   const { validate, schemas } = require('./validate.cjs');
 *   app.post('/api/contact', validate(schemas.contact), handler);
 */
const { z } = require('zod');

const schemas = {
  login: z.object({
    email: z.string().trim().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  contact: z.object({
    name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
    email: z.string().trim().email('A valid email is required'),
    subject: z.string().trim().max(200).optional().default(''),
    message: z.string().trim().min(1, 'Message is required').max(5000, 'Message too long'),
  }),

  newsletter: z.object({
    email: z.string().trim().email('A valid email is required'),
  }),

  kpiUpdate: z.object({
    value: z.union([z.string(), z.number()]).optional(),
    unit: z.string().max(50).optional(),
    name: z.string().max(255).optional(),
  }).passthrough(),

  createUser: z.object({
    username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().trim().email('A valid email is required').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(200),
    role: z.enum(['Viewer', 'Editor', 'Approver', 'Administrator']),
    isActive: z.boolean().optional().default(true),
  }),

  updateUser: z.object({
    username: z.string().trim().min(3).max(50).optional(),
    email: z.string().trim().email('A valid email is required').max(255).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(200).optional(),
    role: z.enum(['Viewer', 'Editor', 'Approver', 'Administrator']).optional(),
    isActive: z.boolean().optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200),
  }),

  statistics: z.object({
    dataType: z.string().min(1),
    period: z.string().min(1),
    value: z.union([z.string(), z.number()]),
    unit: z.string().optional(),
    notes: z.string().max(1000).optional(),
  }),
};

/**
 * Express middleware factory.
 * Validates req.body against the given Zod schema.
 * On failure, responds 400 with { error, details }.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        error: firstIssue?.message ?? 'Invalid request body',
        details: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate, schemas };
