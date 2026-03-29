const express = require('express');
const controller = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const router = express.Router();

router.post('/register', validate({ body: registerSchema }), controller.register);
router.post('/login', validate({ body: loginSchema }), controller.login);
router.get('/profile', authMiddleware, controller.profile);

module.exports = router;
