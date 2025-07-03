const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Le sujet est requis'],
    trim: true,
    maxlength: [200, 'Le sujet ne peut pas dépasser 200 caractères']
  },
  message: {
    type: String,
    required: [true, 'Le message est requis'],
    trim: true,
    maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'closed', 'solved'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'account', 'general'],
    default: 'general'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastReplyAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date,
    default: null
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Modèle pour les réponses aux tickets
const TicketReplySchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu de la réponse est requis'],
    trim: true,
    maxlength: [2000, 'La réponse ne peut pas dépasser 2000 caractères']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false // Les notes privées ne sont visibles que par les admins
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances
TicketSchema.index({ user: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ priority: 1, status: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ lastReplyAt: -1 });

TicketReplySchema.index({ ticket: 1, createdAt: 1 });
TicketReplySchema.index({ user: 1 });

// Middleware pour mettre à jour updatedAt
TicketSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware pour mettre à jour lastReplyAt quand une réponse est ajoutée
TicketReplySchema.post('save', async function() {
  await mongoose.model('Ticket').findByIdAndUpdate(
    this.ticket,
    { 
      lastReplyAt: this.createdAt,
      updatedAt: Date.now()
    }
  );
});

// Méthodes statiques pour les statistiques
TicketSchema.statics.getStats = async function(userId = null, isAdmin = false) {
  const matchStage = isAdmin ? {} : { user: userId };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0, open: 0, pending: 0, closed: 0, solved: 0,
    high: 0, medium: 0, low: 0
  };
};

// Méthode pour obtenir les tickets par catégorie
TicketSchema.statics.getCategoryStats = async function(userId = null, isAdmin = false) {
  const matchStage = isAdmin ? {} : { user: userId };
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Méthode pour marquer un ticket comme lu
TicketSchema.methods.markAsRead = function(userId) {
  // Logique pour marquer comme lu (peut être étendue)
  return this.save();
};

// Méthode pour vérifier si l'utilisateur peut accéder au ticket
TicketSchema.methods.canAccess = function(user) {
  return user.role === 'admin' || this.user.toString() === user.id.toString();
};

// Méthode pour vérifier si l'utilisateur peut modifier le ticket
TicketSchema.methods.canModify = function(user) {
  return user.role === 'admin' || 
    (this.user.toString() === user.id.toString() && this.status !== 'closed' && this.status !== 'solved');
};

const Ticket = mongoose.model('Ticket', TicketSchema);
const TicketReply = mongoose.model('TicketReply', TicketReplySchema);

module.exports = { Ticket, TicketReply };