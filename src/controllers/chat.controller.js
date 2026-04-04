const mongoose = require('mongoose');
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const formatMessage = (messageDoc) => ({
  _id: String(messageDoc._id),
  room: String(messageDoc.room),
  content: messageDoc.content,
  createdAt: messageDoc.createdAt,
  sender: {
    _id: String(messageDoc.sender?._id || ''),
    name: messageDoc.sender?.name || 'Unknown',
    role: messageDoc.sender?.role || 'unknown',
  },
});

const formatRoom = (roomDoc, currentUserId) => {
  const currentId = String(currentUserId);
  const patient = roomDoc.patientUser;
  const staff = roomDoc.staffUser;
  const isPatient = String(patient?._id || patient) === currentId;
  const peer = isPatient ? staff : patient;

  return {
    _id: String(roomDoc._id),
    patientUser: {
      _id: String(patient?._id || patient || ''),
      name: patient?.name || 'Patient',
    },
    staffUser: {
      _id: String(staff?._id || staff || ''),
      name: staff?.name || 'Staff',
    },
    peerUser: {
      _id: String(peer?._id || peer || ''),
      name: peer?.name || 'Unknown',
      role: peer?.role || 'unknown',
    },
    lastMessageAt: roomDoc.lastMessageAt,
    lastMessageSnippet: roomDoc.lastMessageSnippet || '',
    updatedAt: roomDoc.updatedAt,
  };
};

const ensureRoomAccess = async (roomId, userId) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) return { error: { status: 404, message: 'Phòng chat không tồn tại' } };

  const isMember = room.participants.some((participantId) => String(participantId) === String(userId));
  if (!isMember) return { error: { status: 403, message: 'Không có quyền truy cập phòng chat này' } };

  return { room };
};

const pickDefaultStaffId = async () => {
  const staff = await User.findOne({ role: 'staff' }).sort({ createdAt: 1 }).select('_id');
  return staff?._id || null;
};

exports.getRooms = async (req, res) => {
  const userId = req.user._id;
  const rooms = await ChatRoom.find({ participants: userId })
    .populate('patientUser', 'name role')
    .populate('staffUser', 'name role')
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  res.json(rooms.map((room) => formatRoom(room, userId)));
};

exports.ensureRoom = async (req, res) => {
  const currentUser = req.user;

  let patientUserId = null;
  let staffUserId = null;

  if (currentUser.role === 'patient') {
    patientUserId = currentUser._id;
    staffUserId = toObjectId(req.body.staffUserId) || (await pickDefaultStaffId());
    if (!staffUserId) {
      return res.status(400).json({ message: 'Hiện chưa có nhân viên để bắt đầu cuộc trò chuyện' });
    }
  } else if (currentUser.role === 'staff') {
    staffUserId = currentUser._id;
    patientUserId = toObjectId(req.body.patientUserId);
    if (!patientUserId) {
      return res.status(400).json({ message: 'Nhân viên cần chọn bệnh nhân để tạo cuộc trò chuyện' });
    }
  }

  const [patientUser, staffUser] = await Promise.all([
    User.findOne({ _id: patientUserId, role: 'patient' }).select('_id name role'),
    User.findOne({ _id: staffUserId, role: 'staff' }).select('_id name role'),
  ]);

  if (!patientUser) return res.status(400).json({ message: 'Bệnh nhân không hợp lệ' });
  if (!staffUser) return res.status(400).json({ message: 'Nhân viên không hợp lệ' });

  let room = await ChatRoom.findOne({ patientUser: patientUser._id, staffUser: staffUser._id });
  if (!room) {
    room = await ChatRoom.create({
      patientUser: patientUser._id,
      staffUser: staffUser._id,
      participants: [patientUser._id, staffUser._id],
      lastMessageAt: new Date(),
    });
  }

  const populatedRoom = await ChatRoom.findById(room._id)
    .populate('patientUser', 'name role')
    .populate('staffUser', 'name role');

  res.status(201).json(formatRoom(populatedRoom, currentUser._id));
};

exports.getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;
  const { error } = await ensureRoomAccess(roomId, req.user._id);
  if (error) return res.status(error.status).json({ message: error.message });

  const limit = Math.max(Math.min(Number(req.query.limit) || 100, 200), 1);
  const messages = await ChatMessage.find({ room: roomId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('sender', 'name role');

  res.json(messages.map(formatMessage));
};

exports.createMessage = async (req, res) => {
  const { roomId } = req.params;
  const { room, error } = await ensureRoomAccess(roomId, req.user._id);
  if (error) return res.status(error.status).json({ message: error.message });

  const content = String(req.body.content || '').trim();
  if (!content) {
    return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
  }

  const message = await ChatMessage.create({
    room: room._id,
    sender: req.user._id,
    content,
  });

  room.lastMessageAt = message.createdAt;
  room.lastMessageSnippet = content.slice(0, 120);
  await room.save();

  const populatedMessage = await ChatMessage.findById(message._id).populate('sender', 'name role');
  const formattedMessage = formatMessage(populatedMessage);

  const io = req.app.get('io');
  if (io) {
    io.to(`chat:${room._id}`).emit('chat:message', {
      roomId: String(room._id),
      message: formattedMessage,
    });

    room.participants.forEach((participantId) => {
      io.to(`user:${participantId}`).emit('chat:room-updated', {
        roomId: String(room._id),
        lastMessageAt: room.lastMessageAt,
        lastMessageSnippet: room.lastMessageSnippet,
      });
    });
  }

  res.status(201).json(formattedMessage);
};
