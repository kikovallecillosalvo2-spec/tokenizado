const bcrypt = require('bcryptjs');
const userService = require('./user.service');
const tokenService = require('./token.service');

/**
 * Authenticates email/password, creates a session Token, returns token + safe user.
 */
async function login(email, password) {
  const user = await userService.findByEmail(email);
  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const tokenRecord = await tokenService.createToken(user.id);
  const safeUser = userService.sanitizeUser(user);

  return {
    token: tokenRecord.token,
    expiresAt: tokenRecord.expiresAt,
    user: safeUser,
  };
}

module.exports = { login };
