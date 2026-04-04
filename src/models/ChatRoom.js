const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    patientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date },
    lastMessageSnippet: { type: String, default: '' },
  },
  { timestamps: true }
);

chatRoomSchema.index({ patientUser: 1, staffUser: 1 }, { unique: true });
chatRoomSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
