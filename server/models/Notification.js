// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['ticket', 'user', 'system', 'other'],
    default: 'other'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isUnread: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
NotificationSchema.index({ user: 1, isUnread: 1 });
NotificationSchema.index({ createdAt: -1 });

// Static methods
NotificationSchema.statics.createNotification = async function(userId, title, message, type, relatedId) {
  const notification = await this.create({
    user: userId,
    title,
    message,
    type,
    relatedId
  });
  
  // Ici vous pourriez émettre un événement WebSocket/Socket.io
  return notification;
};

module.exports = mongoose.model('Notification', NotificationSchema);