const express = require('express');
const controller = require('../controllers/insurance.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', authorize('admin','staff','patient','doctor'), controller.getAll);
router.post('/', authorize('staff'), controller.create);
router.get('/:id', authorize('admin','staff','patient','doctor'), controller.getById);
router.put('/:id', authorize('staff'), controller.updateById);
router.delete('/:id', authorize('admin'), controller.deleteById);

module.exports = router;