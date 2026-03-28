const express = require('express');
const controller = require('../controllers/fileUpload.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', authorize('admin','staff','patient','doctor'), controller.getAll);
router.post('/', authorize('admin','staff','patient','doctor'), controller.create);
router.get('/:id', authorize('admin','staff','patient','doctor'), controller.getById);
router.delete('/:id', authorize('admin','staff','patient','doctor'), controller.deleteById);

module.exports = router;
