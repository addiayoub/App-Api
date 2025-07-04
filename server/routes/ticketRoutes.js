const express = require('express');
const router = express.Router();
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

module.exports = (io) => {
  router.use(protect);

  router.get('/stats', getTicketStats);
  router.get('/download/:filename', downloadAttachment);
  router.get('/', getTickets);
  router.post('/', uploadFiles, validateTicket, (req, res) => createTicket(req, res, io));
  router.get('/:id', getTicket);
  router.put('/:id', validateTicket, (req, res) => updateTicket(req, res, io));
  router.delete('/:id', adminOnly, (req, res) => deleteTicket(req, res, io));
  router.post('/:id/reply', uploadFiles, validateReply, (req, res) => replyToTicket(req, res, io));
  router.put('/:id/close', (req, res) => closeTicket(req, res, io));
  router.put('/:id/assign', adminOnly, (req, res) => assignTicket(req, res, io));
  router.put('/:id/archive', adminOnly, (req, res) => archiveTicket(req, res, io));

  return router;
};