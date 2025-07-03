const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  billingType: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  isManual: {
    type: Boolean,
    default: false
  },
  paymentMethod: String,
  transactionId: String,
  notes: String
}, {
  timestamps: true
});

// Index pour les recherches fréquentes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ expiresAt: 1 });
SubscriptionSchema.index({ planId: 1 });

// Middleware pour mettre à jour le statut si la date d'expiration est passée
SubscriptionSchema.pre('save', function(next) {
  if (this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
    this.autoRenew = false;
  }
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);