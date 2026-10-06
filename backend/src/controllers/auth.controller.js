const authService = require('../services/auth.service');
const { success, fail } = require('../utils/response');

async function login(req, res) {
  try {
    const { email, password } = req.validated;
    const result = await authService.login(email, password);
    return success(res, {
      status: 200,
      message: 'Inicio de sesión correcto',
      data: result,
    });
  } catch (err) {
    if (err.status === 401) {
      return fail(res, { status: 401, message: err.message });
    }
    console.error('[login]', err);
    return fail(res, { status: 500, message: 'Error al iniciar sesión' });
  }
}

module.exports = { login };
