const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// roomId = patient's userId
function getRoomId(user) {
  if (user.role === 'patient') return String(user._id);
  return null;
}

// Bệnh nhân: lấy tin nhắn phòng của mình
// Staff/admin: lấy tin nhắn theo roomId (patientId) truyền vào query
exports.getMessages = async (req, res) => {
  let roomId;
  if (req.user.role === 'patient') {
    roomId = String(req.user._id);
  } else {
    roomId = req.query.roomId;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId là bắt buộc đối với staff/admin.' });
    }
  }

  const messages = await ChatMessage.find({ roomId })
    .populate('sender', 'name email role')
    .sort('createdAt')
    .limit(100);

  res.json(messages);
};

// Gửi tin nhắn (REST fallback, chủ yếu dùng socket)
exports.sendMessage = async (req, res) => {
  const { content, roomId: bodyRoomId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống.' });
  }


  let roomId;
  if (req.user.role === 'patient') {
    roomId = String(req.user._id);
  } else {
    roomId = bodyRoomId;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId là bắt buộc đối với staff/admin.' });
    }
  }

  const msg = await ChatMessage.create({
    roomId,
    sender: req.user._id,
    senderRole: req.user.role,
    content: content.trim(),
  });

  const populated = await ChatMessage.findById(msg._id).populate('sender', 'name email role');

  // Phát socket tới phòng chat
  const io = req.app.get('io');
  if (io) {
    io.to(`chat:${roomId}`).emit('chat:message', populated);
  }

  res.status(201).json(populated);
};

// Staff lấy danh sách các phòng chat (bệnh nhân đã nhắn)
exports.getRooms = async (req, res) => {
  const rooms = await ChatMessage.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$roomId',
        lastMessage: { $first: '$content' },
        lastAt: { $first: '$createdAt' },
        unread: {
          $sum: {
            $cond: [{ $eq: ['$readAt', null] }, 1, 0],
          },
        },
      },
    },
    { $sort: { lastAt: -1 } },
  ]);

  const roomIds = rooms.map((room) => room._id).filter(Boolean);
  const patientUsers = await User.find({ _id: { $in: roomIds } }).select('name');
  const patientNameMap = patientUsers.reduce((acc, user) => {
    acc[String(user._id)] = user.name;
    return acc;
  }, {});

  const normalizedRooms = rooms.map((room) => ({
    roomId: String(room._id),
    patientName: patientNameMap[String(room._id)] || null,
    lastMessage: room.lastMessage || '',
    lastAt: room.lastAt || null,
    unreadCount: Number(room.unread || 0),
  }));

  res.json(normalizedRooms);
};

// Gửi hình ảnh trong chat (upload qua multipart)
exports.sendImageMessage = async (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).json({ message: 'Không có ảnh được tải lên.' });
  }

  let roomId;
  if (req.user.role === 'patient') {
    roomId = String(req.user._id);
  } else {
    roomId = req.body.roomId;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId là bắt buộc đối với staff/admin.' });
    }
  }

  const imageUrl = `/uploads/${uploadedFile.filename}`;

  const msg = await ChatMessage.create({
    roomId,
    sender: req.user._id,
    senderRole: req.user.role,
    messageType: 'image',
    content: '',
    imageUrl,
  });

  const populated = await ChatMessage.findById(msg._id).populate('sender', 'name email role');

  const io = req.app.get('io');
  if (io) {
    io.to(`chat:${roomId}`).emit('chat:message', populated);
  }

  res.status(201).json(populated);
};

// Đánh dấu đã đọc toàn bộ tin nhắn trong phòng (staff đọc)
exports.markRoomRead = async (req, res) => {
  const { roomId } = req.params;
  await ChatMessage.updateMany({ roomId, readAt: null }, { readAt: new Date() });
  res.json({ message: 'Đã đánh dấu đã đọc.' });
};
