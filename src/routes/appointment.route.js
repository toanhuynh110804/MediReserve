const express = require('express');
const controller = require('../controllers/appointment.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', authorize('patient','admin','staff'), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', authorize('admin','staff','doctor'), controller.updateById);
router.post('/:id/cancel', authorize('patient','admin','staff','doctor'), controller.cancel);

module.exports = router;
