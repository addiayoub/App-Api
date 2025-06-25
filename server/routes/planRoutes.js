const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { ensureAuth } = require('../middleware/auth');

router.get('/plans', planController.getAllPlans);
router.get('/plans/:id', planController.getPlanById);
router.post('/subscribe', ensureAuth, planController.subscribeToPlan);
router.get('/subscription', ensureAuth, planController.getUserSubscription);
router.put('/subscription/cancel', ensureAuth, planController.cancelSubscription);

module.exports = router;