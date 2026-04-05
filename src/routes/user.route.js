const express = require('express');
const controller = require('../controllers/user.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createUserByAdminSchema } = require('../validations/user.validation');
const router = express.Router();

router.use(authMiddleware);
router.post('/', authorize('admin'), validate({ body: createUserByAdminSchema }), controller.createByAdmin);
router.get('/', authorize('admin', 'staff'), controller.getAll);

module.exports = router;
