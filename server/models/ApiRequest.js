const mongoose = require('mongoose');

const apiRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey'
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  status: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

apiRequestSchema.index({ userId: 1 });
apiRequestSchema.index({ apiKeyId: 1 });
apiRequestSchema.index({ createdAt: 1 });

module.exports = mongoose.model('ApiRequest', apiRequestSchema);