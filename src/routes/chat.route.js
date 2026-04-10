const express = require('express');
const controller = require('../controllers/chat.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authMiddleware);

// Bệnh nhân + staff + admin xem tin nhắn
router.get('/messages', authorize('patient', 'staff', 'admin'), controller.getMessages);

// Gửi tin nhắn văn bản
router.post('/messages', authorize('patient', 'staff', 'admin'), controller.sendMessage);

// Gửi hình ảnh trong chat
router.post('/messages/image', authorize('patient', 'staff', 'admin'), uploadSingle('image'), controller.sendImageMessage);

// Staff/admin xem danh sách các phòng chat
router.get('/rooms', authorize('staff', 'admin'), controller.getRooms);

// Staff/admin đánh dấu đã đọc
router.post('/rooms/:roomId/read', authorize('staff', 'admin'), controller.markRoomRead);

module.exports = router;
