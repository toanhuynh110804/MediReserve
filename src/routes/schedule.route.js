const express = require('express');
const controller = require('../controllers/schedule.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', authorize('admin', 'doctor', 'staff'), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', authorize('admin', 'doctor', 'staff'), controller.updateById);
router.delete('/:id', authorize('admin', 'doctor', 'staff'), controller.deleteById);

module.exports = router;
