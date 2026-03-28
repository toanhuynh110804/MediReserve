const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: Number,
    mimeType: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('FileUpload', fileUploadSchema);
