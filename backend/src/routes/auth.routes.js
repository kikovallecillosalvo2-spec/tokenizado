const { Router } = require('express');
const { login } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/user.schemas');

const router = Router();
router.post('/login', validate(loginSchema), login);

module.exports = router;
