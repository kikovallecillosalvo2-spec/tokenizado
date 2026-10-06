/**
 * Critical API tests using Node's built-in test runner + supertest.
 * Run: npm test
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const prisma = new PrismaClient();

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';
let authToken = null;

before(async () => {
  // Ensure at least one seeded-style user exists for login tests
  const hashed = await bcrypt.hash(TEST_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: 'ana@demo.com' },
    update: {},
    create: {
      name: 'Ana García',
      email: 'ana@demo.com',
      password: hashed,
    },
  });
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } }).catch(() => {});
  await prisma.$disconnect();
});

describe('GET /api/health', () => {
  it('returns 200 with success true', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
    assert.equal(res.body.data.status, 'ok');
  });
});

describe('GET /api/users', () => {
  it('returns users without passwords', async () => {
    const res = await request(app).get('/api/users');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.users));
    assert.ok(res.body.data.users.length <= 10);
    for (const u of res.body.data.users) {
      assert.equal(u.password, undefined);
      assert.ok(u.email);
      assert.ok(u.name);
    }
  });
});

describe('POST /api/users', () => {
  it('creates a user and never returns password', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test User', email: TEST_EMAIL, password: TEST_PASSWORD });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, TEST_EMAIL);
    assert.equal(res.body.data.user.password, undefined);
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Dup', email: TEST_EMAIL, password: TEST_PASSWORD });
    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  it('rejects weak password with 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Weak', email: 'weak@example.com', password: 'short' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in and returns token + user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.user);
    assert.equal(res.body.data.user.password, undefined);
    authToken = res.body.data.token;
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass1!' });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});

describe('PATCH /api/users/name', () => {
  it('updates name with valid Bearer token', async () => {
    assert.ok(authToken, 'authToken must be set by login test');
    const res = await request(app)
      .patch('/api/users/name')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Name' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.name, 'Updated Name');
    assert.equal(res.body.data.user.password, undefined);
  });

  it('rejects missing token with 401', async () => {
    const res = await request(app)
      .patch('/api/users/name')
      .send({ name: 'No Auth' });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});
