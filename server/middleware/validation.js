// middleware/validation.js
const { body, validationResult } = require('express-validator');

// Validation for creating/updating a ticket
exports.validateTicket = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Le sujet est requis')
    .isLength({ max: 200 })
    .withMessage('Le sujet ne peut pas dépasser 200 caractères'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ max: 2000 })
    .withMessage('Le message ne peut pas dépasser 2000 caractères'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('La priorité doit être low, medium ou high'),
  body('category')
    .optional()
    .isIn(['technical', 'billing', 'account', 'general'])
    .withMessage('La catégorie doit être technical, billing, account ou general'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// Validation for ticket replies
exports.validateReply = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Le contenu de la réponse est requis')
    .isLength({ max: 2000 })
    .withMessage('La réponse ne peut pas dépasser 2000 caractères'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];