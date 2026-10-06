const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { env } = require('../config/env');

const prisma = new PrismaClient();

/**
 * Creates a secure session token for a user (7-day expiry by default).
 */
async function createToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.tokenExpiryDays);

  const record = await prisma.token.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return record;
}

/**
 * Finds a valid (non-expired) token by value.
 */
async function findValidToken(tokenValue) {
  const record = await prisma.token.findUnique({
    where: { token: tokenValue },
    include: { user: true },
  });

  if (!record) return null;
  if (new Date() > new Date(record.expiresAt)) return null;
  return record;
}

/**
 * Deletes expired tokens (optional cleanup helper).
 */
async function deleteExpiredTokens() {
  return prisma.token.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

module.exports = { createToken, findValidToken, deleteExpiredTokens };
