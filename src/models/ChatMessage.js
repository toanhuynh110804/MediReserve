const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    // Phòng chat: mỗi bệnh nhân có 1 phòng chat riêng với nhân viên
    roomId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['patient', 'staff', 'admin'], required: true },
    content: { type: String, required: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// roomId = patient userId để đơn giản hóa
module.exports = mongoose.model('ChatMessage', chatMessageSchema);
