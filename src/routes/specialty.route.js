const express = require('express');
const controller = require('../controllers/specialty.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', authorize('admin'), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', authorize('admin'), controller.updateById);
router.delete('/:id', authorize('admin'), controller.deleteById);

module.exports = router;
