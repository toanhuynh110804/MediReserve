const express = require('express');
const controller = require('../controllers/staff.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createStaffSchema, updateStaffSchema } = require('../validations/staff.validation');
const router = express.Router();

router.use(authMiddleware, authorize('admin'));
router.get('/', controller.getAll);
router.post('/', validate({ body: createStaffSchema }), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', validate({ body: updateStaffSchema }), controller.updateById);
router.delete('/:id', controller.deleteById);

module.exports = router;
