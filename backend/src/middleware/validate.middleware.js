const { fail } = require('../utils/response');

/**
 * Zod validation middleware factory.
 * Validates req.body against the given schema.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      return fail(res, {
        status: 400,
        message: errors[0]?.message || 'Datos de entrada no válidos',
        data: { errors },
      });
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
