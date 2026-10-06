const { fail } = require('../utils/response');

/**
 * 404 handler for unknown routes.
 */
function notFoundHandler(req, res) {
  return fail(res, {
    status: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Central error handler. Never leak stack traces in production.
 */
function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err);

  if (err.code === 'P2002') {
    return fail(res, {
      status: 409,
      message: 'Ya existe un registro con ese valor único',
      data: { fields: err.meta?.target || [] },
    });
  }

  if (err.code === 'P2025') {
    return fail(res, {
      status: 404,
      message: 'Registro no encontrado',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500
      ? 'Error interno del servidor'
      : err.message || 'Error inesperado';

  return fail(res, { status, message });
}

module.exports = { notFoundHandler, errorHandler };
