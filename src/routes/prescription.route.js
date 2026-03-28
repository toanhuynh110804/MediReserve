const express = require('express');
const controller = require('../controllers/prescription.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', authorize('admin','doctor','staff','patient'), controller.getAll);
router.post('/', authorize('doctor','admin','staff'), controller.create);
router.get('/:id', authorize('admin','doctor','staff','patient'), controller.getById);
router.put('/:id', authorize('doctor','admin','staff'), controller.updateById);
router.delete('/:id', authorize('admin'), controller.deleteById);

module.exports = router;
