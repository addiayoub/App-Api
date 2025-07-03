const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

router.get('/plans', planController.getAllPlans);
router.get('/plans/:id', planController.getPlanById);
router.post('/subscribe', ensureAuth, planController.subscribeToPlan);
router.get('/subscription', ensureAuth, planController.getUserSubscription);
router.delete('/subscription', ensureAuth, planController.cancelSubscription);

// Routes d'administration
router.put('/plans/:id', ensureAuth, ensureAdmin, planController.updatePlan);
router.post('/plans', ensureAuth, ensureAdmin, planController.createPlan);
router.delete('/plans/:id', ensureAuth, ensureAdmin, planController.deletePlan);

// Nouvelles routes pour la gestion des abonnements utilisateur
router.put('/users/:userId/subscriptions/:subscriptionId', ensureAuth, ensureAdmin, planController.updateUserSubscription);
router.post('/users/:userId/generate-token', ensureAuth, ensureAdmin, planController.generateNewUserToken);
module.exports = router;