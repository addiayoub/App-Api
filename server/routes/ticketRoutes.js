const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  replyToTicket,
  closeTicket,
  getTicketStats,
  assignTicket,
  archiveTicket,
  downloadAttachment,
  uploadFiles
} = require('../controllers/ticketController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateTicket, validateReply } = require('../middleware/validation');

const router = express.Router();

// Routes protégées - nécessitent une authentification
router.use(protect);

// @route   GET /api/tickets/stats
// @desc    Obtenir les statistiques des tickets
// @access  Private
router.get('/stats', getTicketStats);

// @route   GET /api/tickets/download/:filename
// @desc    Télécharger un fichier joint
// @access  Private
router.get('/download/:filename', downloadAttachment);

// @route   GET /api/tickets
// @desc    Obtenir tous les tickets (filtrés par utilisateur si pas admin)
// @access  Private
router.get('/', getTickets);

// @route   POST /api/tickets
// @desc    Créer un nouveau ticket
// @access  Private
router.post('/', uploadFiles, validateTicket, createTicket);

// @route   GET /api/tickets/:id
// @desc    Obtenir un ticket spécifique avec ses réponses
// @access  Private
router.get('/:id', getTicket);

// @route   PUT /api/tickets/:id
// @desc    Mettre à jour un ticket
// @access  Private
router.put('/:id', validateTicket, updateTicket);

// @route   DELETE /api/tickets/:id
// @desc    Supprimer un ticket (admin seulement)
// @access  Private/Admin
router.delete('/:id', adminOnly, deleteTicket);

// @route   POST /api/tickets/:id/reply
// @desc    Répondre à un ticket
// @access  Private
router.post('/:id/reply', uploadFiles, validateReply, replyToTicket);

// @route   PUT /api/tickets/:id/close
// @desc    Fermer un ticket
// @access  Private
router.put('/:id/close', closeTicket);

// @route   PUT /api/tickets/:id/assign
// @desc    Assigner un ticket à un admin
// @access  Private/Admin
router.put('/:id/assign', adminOnly, assignTicket);

// @route   PUT /api/tickets/:id/archive
// @desc    Archiver un ticket
// @access  Private/Admin
router.put('/:id/archive', adminOnly, archiveTicket);

module.exports = router;