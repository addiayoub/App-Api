const { Ticket, TicketReply } = require('../models/Ticket');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Notification = require('../models/Notification');
const { 
  sendNewTicketEmail, 
  sendTicketReplyEmail, 
  sendTicketClosedEmail 
} = require('../config/email');

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

    // Exécuter la requête
    const tickets = await Ticket.find(filter)
      .populate('user', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(filter);

    // Obtenir les réponses
    const ticketIds = tickets.map(t => t._id);
    const repliesFilter = { ticket: { $in: ticketIds } };

    const allReplies = await TicketReply.find(repliesFilter)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 });

    // Grouper les réponses
    const repliesByTicket = {};
    allReplies.forEach(reply => {
      if (!repliesByTicket[reply.ticket]) {
        repliesByTicket[reply.ticket] = [];
      }
      repliesByTicket[reply.ticket].push(reply);
    });

    // Construire le résultat final
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
    next(error);
  }
};

// @desc    Obtenir un ticket par ID
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
    const replies = await TicketReply.find({ ticket: ticket._id })
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
      .lean();

    // Ajouter les champs manquants
    populatedTicket.replies = [];
    populatedTicket.repliesCount = 0;
    populatedTicket.lastReply = null;

    // Envoyer les emails de notification
    const user = await User.findById(req.user.id);
    await sendNewTicketEmail(user, ticket); // Email à l'utilisateur

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNewTicketEmail(admin, ticket, true); // Email aux admins
    }

    // Créer les notifications
    await Notification.createNotification(
      ticket.user, 
      'Nouveau ticket créé', 
      `Votre ticket "${ticket.subject}" a été créé avec succès.`,
      'ticket',
      ticket._id
    );

    for (const admin of admins) {
      await Notification.createNotification(
        admin._id,
        'Nouveau ticket créé',
        `Un nouveau ticket "${ticket.subject}" a été créé par ${req.user.name}.`,
        'ticket',
        ticket._id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Ticket créé avec succès',
      data: populatedTicket
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Répondre à un ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
exports.replyToTicket = async (req, res, next) => {
  try {
    const { content } = req.body;
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
    } else if (ticket.status === 'open' && isAdminReply) {
      updates.status = 'pending';
    }

    await Ticket.findByIdAndUpdate(ticketId, updates);

    const populatedReply = await TicketReply.findById(reply._id)
      .populate('user', 'name email avatar role')
      .lean();

    // Envoyer les emails de notification
    if (isAdminReply && ticket.user.toString() !== req.user.id.toString()) {
      const ticketUser = await User.findById(ticket.user);
      await sendTicketReplyEmail(ticketUser, ticket, reply, true); // Email à l'utilisateur
    }
    
    // Si c'est une réponse utilisateur, notifier les admins
    if (!isAdminReply) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendTicketReplyEmail(admin, ticket, reply, false); // Email aux admins
      }
    }

    // Créer des notifications
    if (isAdminReply && ticket.user.toString() !== req.user.id.toString()) {
      await Notification.createNotification(
        ticket.user,
        'Nouvelle réponse à votre ticket',
        `Une réponse a été ajoutée à votre ticket "${ticket.subject}".`,
        'ticket',
        ticket._id
      );
    }
    
    if (!isAdminReply) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.createNotification(
          admin._id,
          'Nouvelle réponse de l\'utilisateur',
          `${req.user.name} a répondu au ticket "${ticket.subject}".`,
          'ticket',
          ticket._id
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: populatedReply
    });

  } catch (error) {
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

    // Si le ticket est fermé, enregistrer qui l'a fermé
    if (updates.status === 'closed' || updates.status === 'solved') {
      updates.closedAt = Date.now();
      updates.closedBy = req.user.id;
      
      // Envoyer l'email de notification
      const ticketUser = await User.findById(ticket.user);
      await sendTicketClosedEmail(ticketUser, {
        ...ticket.toObject(),
        ...updates
      });
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

    // Envoyer l'email de notification
    const ticketUser = await User.findById(ticket.user);
    await sendTicketClosedEmail(ticketUser, updatedTicket);

    res.status(200).json({
      success: true,
      message: 'Ticket fermé avec succès',
      data: updatedTicket
    });

  } catch (error) {
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

    // Supprimer les réponses associées
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
    
    res.download(filePath);

  } catch (error) {
    next(error);
  }
};

// Middleware pour l'upload de fichiers
exports.uploadFiles = upload.array('attachments', 5);

module.exports = exports;