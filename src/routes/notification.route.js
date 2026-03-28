const express = require('express');
const controller = require('../controllers/notification.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', authorize('admin','staff','patient','doctor'), controller.getAll);
router.post('/', authorize('admin','staff'), controller.create);
router.post('/:id/read', authorize('admin','staff','patient','doctor'), controller.markRead);
router.delete('/:id', authorize('admin','staff','patient','doctor'), controller.deleteById);

module.exports = router;
