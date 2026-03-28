const express = require('express');
const controller = require('../controllers/doctor.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.getAll);
router.get('/me', controller.myProfile);
router.post('/', authorize('admin', 'staff'), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', authorize('admin', 'staff'), controller.updateById);
router.delete('/:id', authorize('admin'), controller.deleteById);

module.exports = router;
