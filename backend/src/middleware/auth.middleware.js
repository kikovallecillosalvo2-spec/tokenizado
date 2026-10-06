const { PrismaClient } = require('@prisma/client');
const { fail } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Bearer token authentication middleware.
 * Loads the Token, checks expiry, attaches user (without password) to req.user.
 */
async function authBearer(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return fail(res, {
        status: 401,
        message: 'Token de autenticación requerido. Usa Authorization: Bearer <token>',
      });
    }

    const tokenValue = header.slice(7).trim();
    if (!tokenValue) {
      return fail(res, { status: 401, message: 'Token vacío' });
    }

    const tokenRecord = await prisma.token.findUnique({
      where: { token: tokenValue },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      return fail(res, { status: 401, message: 'Token inválido' });
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return fail(res, { status: 401, message: 'Token expirado. Inicia sesión de nuevo' });
    }

    req.user = tokenRecord.user;
    req.token = tokenRecord;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authBearer };
