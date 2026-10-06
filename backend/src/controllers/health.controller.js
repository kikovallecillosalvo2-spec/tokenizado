const { success, fail } = require('../utils/response');

async function getHealth(req, res) {
  try {
    return success(res, {
      status: 200,
      message: 'API operativa',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (err) {
    console.error('[health]', err);
    return fail(res, { status: 500, message: 'Error al comprobar salud del servicio' });
  }
}

module.exports = { getHealth };
