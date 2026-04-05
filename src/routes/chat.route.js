const express = require('express');
const controller = require('../controllers/chat.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('patient', 'staff'));

router.get('/rooms', controller.getRooms);
router.post('/rooms/ensure', controller.ensureRoom);
router.get('/rooms/:roomId/messages', controller.getMessagesByRoom);
router.post('/rooms/:roomId/messages', controller.createMessage);

module.exports = router;
