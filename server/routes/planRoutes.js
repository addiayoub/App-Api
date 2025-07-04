const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

// Routes publiques
router.get('/plans', planController.getAllPlans);
router.get('/plans-with-endpoints', planController.getAllPlansWithEndpoints);
router.get('/plans/:id', planController.getPlanById);
router.get('/endpoints/:planType', planController.getAvailableEndpoints);
router.get('/all-endpoints-by-tag', planController.getAllEndpointsByTag);
router.post('/execute-api', planController.executeApiForUser);

// Routes utilisateur authentifié
router.post('/subscribe', ensureAuth, planController.subscribeToPlan);
router.get('/subscription', ensureAuth, planController.getUserSubscription);
router.delete('/subscription', ensureAuth, planController.cancelSubscription);

// Routes d'administration
router.put('/plans/:id', ensureAuth, ensureAdmin, planController.updatePlan);
router.post('/plans', ensureAuth, ensureAdmin, planController.createPlan);
router.delete('/plans/:id', ensureAuth, ensureAdmin, planController.deletePlan);
router.get('/plans/:id/users', ensureAuth, ensureAdmin, planController.getPlanWithUsers);
router.get('/plans-stats', ensureAuth, ensureAdmin, planController.getPlanStats);

// Routes pour la gestion des abonnements utilisateur
router.put('/users/:userId/subscriptions/:subscriptionId', ensureAuth, ensureAdmin, planController.updateUserSubscription);
router.post('/users/:userId/generate-token', ensureAuth, ensureAdmin, planController.generateNewUserToken);
router.get('/expired-subscriptions', ensureAuth, ensureAdmin, planController.checkExpiredSubscriptions);

module.exports = router;