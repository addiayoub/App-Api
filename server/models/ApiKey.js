const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

apiKeySchema.index({ userId: 1 });
apiKeySchema.index({ key: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);