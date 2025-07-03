const { Ticket, TicketReply } = require('../models/Ticket');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Notification = require('../models/Notification');

// Configuration Multer pour les fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/tickets');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ticket-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// @desc    Obtenir tous les tickets (utilisateur ou admin)
// @route   GET /api/tickets
// @access  Private
// @desc    Obtenir tous les tickets (utilisateur ou admin)
// @route   GET /api/tickets
// @access  Private
// @desc    Obtenir tous les tickets (utilisateur ou admin)
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
      sortBy = 'lastReplyAt',
      sortOrder = 'desc',
      assignedTo
    } = req.query;

    // Construire le filtre
    let filter = {};
    
    // CORRECTION: Si ce n'est pas un admin, filtrer par utilisateur
    // Les admins peuvent voir TOUS les tickets
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }

    // Filtres optionnels
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Exécuter la requête pour obtenir les tickets
    const tickets = await Ticket.find(filter)
      .populate('user', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Obtenir le nombre total pour la pagination
    const total = await Ticket.countDocuments(filter);

    // Obtenir TOUTES les réponses pour chaque ticket en une seule requête
    const ticketIds = tickets.map(t => t._id);
    
    // CORRECTION: Les admins peuvent voir les réponses privées
    const repliesFilter = { ticket: { $in: ticketIds } };
    if (req.user.role !== 'admin') {
      repliesFilter.isPrivate = { $ne: true }; // Exclure les réponses privées pour les non-admins
    }

    const allReplies = await TicketReply.find(repliesFilter)
      .populate('user', 'name email avatar role');

    // Grouper les réponses par ticket
    const repliesByTicket = {};
    allReplies.forEach(reply => {
      if (!repliesByTicket[reply.ticket]) {
        repliesByTicket[reply.ticket] = [];
      }
      repliesByTicket[reply.ticket].push(reply);
    });

    // Construire le résultat final avec les réponses incluses
    const ticketsWithReplies = tickets.map(ticket => {
      const ticketObj = ticket.toObject();
      return {
        ...ticketObj,
        replies: repliesByTicket[ticket._id] || [],
        repliesCount: repliesByTicket[ticket._id]?.length || 0,
        lastReply: repliesByTicket[ticket._id]?.slice(-1)[0] || null
      };
    });

    res.status(200).json({
      success: true,
      data: ticketsWithReplies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    next(error);
  }
};
// @desc    Obtenir un ticket par ID avec ses réponses
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email avatar role')
      .populate('assignedTo', 'name email avatar')
      .populate('closedBy', 'name email');

    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    // Vérifier les permissions
    if (!ticket.canAccess(req.user)) {
      return next(new ErrorResponse('Accès non autorisé', 403));
    }

    // Obtenir les réponses
    const repliesFilter = { ticket: ticket._id };
    
    // Si ce n'est pas un admin, exclure les notes privées
    if (req.user.role !== 'admin') {
      repliesFilter.isPrivate = { $ne: true };
    }

    const replies = await TicketReply.find(repliesFilter)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...ticket.toObject(),
        replies
      }
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    next(error);
  }
};

// @desc    Créer un nouveau ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, message, priority, category, tags } = req.body;

    // Traiter les fichiers joints
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date()
      }));
    }

    const ticket = await Ticket.create({
      subject,
      message,
      priority: priority || 'medium',
      category: category || 'general',
      user: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      attachments,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReplyAt: new Date()
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('user', 'name email avatar')
      .lean(); // Convertir en objet simple

    // Ajouter les champs manquants
    populatedTicket.replies = [];
    populatedTicket.repliesCount = 0;
    populatedTicket.lastReply = null;

    res.status(201).json({
      success: true,
      message: 'Ticket créé avec succès',
      data: populatedTicket
    });
await Notification.createNotification(
  ticket.user, 
  'Nouveau ticket créé', 
  `Votre ticket "${ticket.subject}" a été créé avec succès.`,
  'ticket',
  ticket._id
);
const admins = await User.find({ role: 'admin' });
for (const admin of admins) {
  await Notification.createNotification(
    admin._id,
    'Nouveau ticket créé',
    `Un nouveau ticket "${ticket.subject}" a été créé par ${req.user.name}.`,
    'ticket',
    ticket._id
  );
}

  } catch (error) {
    console.error('Create ticket error:', error);
    next(error);
  }
};

// @desc    Répondre à un ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
exports.replyToTicket = async (req, res, next) => {
  try {
    const { content, isPrivate = false } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    // Vérifier les permissions
    if (!ticket.canAccess(req.user)) {
      return next(new ErrorResponse('Accès non autorisé', 403));
    }

    const isAdminReply = req.user.role === 'admin';
    const isPrivateNote = isPrivate && isAdminReply;

    // Traiter les fichiers joints
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date()
      }));
    }

    const reply = await TicketReply.create({
      ticket: ticketId,
      user: req.user.id,
      content,
      isAdmin: isAdminReply,
      isPrivate: isPrivateNote,
      attachments,
      createdAt: new Date()
    });

    // Mettre à jour le ticket
    const updates = {
      lastReplyAt: new Date(),
      updatedAt: new Date()
    };

    if (ticket.status === 'closed' && !isAdminReply) {
      updates.status = 'open';
    } else if (ticket.status === 'open' && isAdminReply && !isPrivateNote) {
      updates.status = 'pending';
    }

    await Ticket.findByIdAndUpdate(ticketId, updates);

    const populatedReply = await TicketReply.findById(reply._id)
      .populate('user', 'name email avatar role')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: populatedReply
    });

  } catch (error) {
    console.error('Reply to ticket error:', error);
    next(error);
  }
};
// @desc    Mettre à jour un ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    // Vérifier les permissions
    if (!ticket.canModify(req.user)) {
      return next(new ErrorResponse('Modification non autorisée', 403));
    }

    const allowedFields = req.user.role === 'admin' 
      ? ['subject', 'priority', 'category', 'status', 'assignedTo', 'tags']
      : ['subject', 'priority', 'category', 'tags'];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && typeof req.body[field] === 'string') {
          updates[field] = req.body[field].split(',').map(tag => tag.trim());
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // Si le ticket est fermé, enregistrer qui l'a fermé et quand
    if (updates.status === 'closed' || updates.status === 'solved') {
      updates.closedAt = Date.now();
      updates.closedBy = req.user.id;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar')
     .populate('assignedTo', 'name email avatar')
     .populate('closedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Ticket mis à jour avec succès',
      data: updatedTicket
    });

  } catch (error) {
    console.error('Update ticket error:', error);
    next(error);
  }
};

// @desc    Fermer un ticket
// @route   PUT /api/tickets/:id/close
// @access  Private
exports.closeTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    // Vérifier les permissions
    if (!ticket.canAccess(req.user)) {
      return next(new ErrorResponse('Accès non autorisé', 403));
    }

    ticket.status = 'closed';
    ticket.closedAt = Date.now();
    ticket.closedBy = req.user.id;

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('user', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('closedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Ticket fermé avec succès',
      data: updatedTicket
    });

  } catch (error) {
    console.error('Close ticket error:', error);
    next(error);
  }
};

// @desc    Supprimer un ticket (admin seulement)
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
exports.deleteTicket = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Accès non autorisé', 403));
    }

    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    // Supprimer toutes les réponses associées
    await TicketReply.deleteMany({ ticket: req.params.id });

    // Supprimer les fichiers joints
    if (ticket.attachments && ticket.attachments.length > 0) {
      for (const attachment of ticket.attachments) {
        try {
          await fs.unlink(attachment.path);
        } catch (error) {
          console.error('Erreur lors de la suppression du fichier:', error);
        }
      }
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Ticket supprimé avec succès'
    });

  } catch (error) {
    console.error('Delete ticket error:', error);
    next(error);
  }
};

// @desc    Obtenir les statistiques des tickets
// @route   GET /api/tickets/stats
// @access  Private
exports.getTicketStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = isAdmin ? null : req.user.id;

    const stats = await Ticket.getStats(userId, isAdmin);
    const categoryStats = await Ticket.getCategoryStats(userId, isAdmin);

    // Statistiques par période (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filter = isAdmin ? {} : { user: req.user.id };
    filter.createdAt = { $gte: thirtyDaysAgo };

    const recentTickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        categories: categoryStats,
        recent: recentTickets
      }
    });

  } catch (error) {
    console.error('Get ticket stats error:', error);
    next(error);
  }
};

// @desc    Assigner un ticket à un admin
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Accès non autorisé', 403));
    }

    const { assignedTo } = req.body;
    
    // Vérifier que l'utilisateur assigné est un admin
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || assignee.role !== 'admin') {
        return next(new ErrorResponse('L\'utilisateur assigné doit être un admin', 400));
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: assignedTo || null },
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar')
     .populate('assignedTo', 'name email avatar');

    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    res.status(200).json({
      success: true,
      message: assignedTo ? 'Ticket assigné avec succès' : 'Assignment du ticket supprimée',
      data: ticket
    });

  } catch (error) {
    console.error('Assign ticket error:', error);
    next(error);
  }
};

// @desc    Archiver un ticket
// @route   PUT /api/tickets/:id/archive
// @access  Private/Admin
exports.archiveTicket = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Accès non autorisé', 403));
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!ticket) {
      return next(new ErrorResponse('Ticket non trouvé', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Ticket archivé avec succès',
      data: ticket
    });

  } catch (error) {
    console.error('Archive ticket error:', error);
    next(error);
  }
};

// @desc    Télécharger un fichier joint
// @route   GET /api/tickets/download/:filename
// @access  Private
exports.downloadAttachment = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/tickets', filename);

    // Vérifier que le fichier existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return next(new ErrorResponse('Fichier non trouvé', 404));
    }

    // Vérifier que l'utilisateur a accès au fichier
    // (vous pourriez vouloir ajouter une vérification plus stricte ici)
    
    res.download(filePath);

  } catch (error) {
    console.error('Download attachment error:', error);
    next(error);
  }
};

// Middleware pour l'upload de fichiers
exports.uploadFiles = upload.array('attachments', 5);

module.exports = exports;