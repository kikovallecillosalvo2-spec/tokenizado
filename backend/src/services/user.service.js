const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Returns the first 10 users without passwords.
 */
async function listUsers(limit = 10) {
  return prisma.user.findMany({
    take: limit,
    orderBy: { id: 'asc' },
    select: USER_SAFE_SELECT,
  });
}

/**
 * Creates a user with a hashed password. Throws if email exists.
 */
async function createUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Ya existe un usuario con ese email');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: USER_SAFE_SELECT,
  });

  return user;
}

/**
 * Updates a user's name. Never returns password.
 */
async function updateName(userId, name) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: USER_SAFE_SELECT,
  });
}

/**
 * Finds a user by email (includes password for auth comparison).
 */
async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Counts total users (for dashboard stats).
 */
async function countUsers() {
  return prisma.user.count();
}

/**
 * Strips password from a user object.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

module.exports = {
  listUsers,
  createUser,
  updateName,
  findByEmail,
  countUsers,
  sanitizeUser,
  USER_SAFE_SELECT,
};
