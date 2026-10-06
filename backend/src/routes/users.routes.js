const { Router } = require('express');
const { getUsers, createUser, updateName } = require('../controllers/user.controller');
const { validate } = require('../middleware/validate.middleware');
const { authBearer } = require('../middleware/auth.middleware');
const { createUserSchema, updateNameSchema } = require('../validators/user.schemas');

const router = Router();

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.patch('/name', authBearer, validate(updateNameSchema), updateName);

module.exports = router;
