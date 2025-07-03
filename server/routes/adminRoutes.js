const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  resetUserPassword,
  getUserStats,
  cleanupExpiredTokens
} = require('../controllers/adminController');

// Middleware d'authentification et d'autorisation
const { protect, authorize } = require('../middleware/auth');

// Appliquer la protection et l'autorisation admin à toutes les routes
router.use(protect);
router.use(authorize('admin'));

// Routes pour les statistiques et nettoyage
router.get('/users/stats', getUserStats);
router.post('/users/cleanup-tokens', cleanupExpiredTokens);

// Routes pour la gestion des utilisateurs
router.route('/users')
  .get(getUsers)           // GET /api/admin/users - Récupérer tous les utilisateurs
  .post(createUser);       // POST /api/admin/users - Créer un utilisateur

router.route('/users/bulk')
  .delete(bulkDeleteUsers); // DELETE /api/admin/users/bulk - Supprimer plusieurs utilisateurs

router.route('/users/:id')
  .get(getUserById)        // GET /api/admin/users/:id - Récupérer un utilisateur
  .put(updateUser)         // PUT /api/admin/users/:id - Mettre à jour un utilisateur
  .delete(deleteUser);     // DELETE /api/admin/users/:id - Supprimer un utilisateur

router.post('/users/:id/reset-password', resetUserPassword); // POST /api/admin/users/:id/reset-password

module.exports = router;