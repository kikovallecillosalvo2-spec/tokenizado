const userService = require('../services/user.service');
const { success, fail } = require('../utils/response');

async function getUsers(req, res) {
  try {
    const users = await userService.listUsers(10);
    return success(res, {
      status: 200,
      message: 'Usuarios obtenidos correctamente',
      data: { users, count: users.length },
    });
  } catch (err) {
    console.error('[getUsers]', err);
    return fail(res, { status: 500, message: 'Error al obtener usuarios' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password } = req.validated;
    const user = await userService.createUser({ name, email, password });
    return success(res, {
      status: 201,
      message: 'Usuario creado correctamente',
      data: { user },
    });
  } catch (err) {
    if (err.status === 409) {
      return fail(res, { status: 409, message: err.message });
    }
    console.error('[createUser]', err);
    return fail(res, { status: 500, message: 'Error al crear usuario' });
  }
}

async function updateName(req, res) {
  try {
    const { name } = req.validated;
    const user = await userService.updateName(req.user.id, name);
    return success(res, {
      status: 200,
      message: 'Nombre actualizado correctamente',
      data: { user },
    });
  } catch (err) {
    if (err.status === 404) {
      return fail(res, { status: 404, message: err.message });
    }
    console.error('[updateName]', err);
    return fail(res, { status: 500, message: 'Error al actualizar el nombre' });
  }
}

module.exports = { getUsers, createUser, updateName };
