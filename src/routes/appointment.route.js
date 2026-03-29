const express = require('express');
const controller = require('../controllers/appointment.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  listQuerySchema,
  createSchema,
  updateSchema,
  cancelBodySchema,
} = require('../validations/appointment.validation');
const { idParamSchema } = require('../validations/common.validation');
const router = express.Router();

router.use(authMiddleware);
router.get('/', validate({ query: listQuerySchema }), controller.getAll);
router.post(
  '/',
  authorize('patient', 'admin', 'staff'),
  validate({ body: createSchema }),
  controller.create
);
router.get('/:id', validate({ params: idParamSchema }), controller.getById);
router.put(
  '/:id',
  authorize('admin', 'staff', 'doctor'),
  validate({ params: idParamSchema, body: updateSchema }),
  controller.updateById
);
router.post(
  '/:id/cancel',
  authorize('patient', 'admin', 'staff', 'doctor'),
  validate({ params: idParamSchema, body: cancelBodySchema }),
  controller.cancel
);

module.exports = router;
