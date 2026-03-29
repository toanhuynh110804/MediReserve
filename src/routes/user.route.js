const express = require('express');
const controller = require('../controllers/user.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware, authorize('admin'));
router.get('/', controller.getAll);

module.exports = router;
