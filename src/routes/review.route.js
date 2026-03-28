const express = require('express');
const controller = require('../controllers/review.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', authorize('admin','doctor','staff','patient'), controller.getAll);
router.post('/', authorize('patient','admin','staff'), controller.create);
router.get('/:id', authorize('admin','doctor','staff','patient'), controller.getById);
router.put('/:id', authorize('admin','staff','patient'), controller.updateById);
router.delete('/:id', authorize('admin'), controller.deleteById);

module.exports = router;
