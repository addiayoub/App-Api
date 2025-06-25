const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

const planController = {
  getAllPlans: async (req, res) => {
    try {
      const plans = await Plan.find({ active: true }).sort({ monthlyPrice: 1 });
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getPlanById: async (req, res) => {
    try {
      const plan = await Plan.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }
      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  subscribeToPlan: async (req, res) => {
    try {
      const { planId, billingType } = req.body;
      const userId = req.user.id;

      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      const existingSubscription = await Subscription.findOne({
        userId,
        status: 'active'
      });

      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          message: 'User already has an active subscription'
        });
      }

      const price = billingType === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      const duration = billingType === 'annual' ? 365 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);

      const subscription = new Subscription({
        userId,
        planId,
        planName: plan.name,
        billingType,
        price,
        expiresAt
      });

      await subscription.save();

      res.status(201).json({
        success: true,
        data: {
          id: subscription._id,
          plan: subscription.planName,
          expires_at: subscription.expiresAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getUserSubscription: async (req, res) => {
    try {
      const userId = req.user.id;
      const subscription = await Subscription.findOne({
        userId,
        status: 'active'
      }).populate('planId');

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
      }

      res.json({
        success: true,
        data: {
          id: subscription._id,
          plan: subscription.planName,
          expires_at: subscription.expiresAt,
          billingType: subscription.billingType,
          price: subscription.price,
          startDate: subscription.startDate,
          autoRenew: subscription.autoRenew
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  cancelSubscription: async (req, res) => {
    try {
      const userId = req.user.id;
      const subscription = await Subscription.findOne({
        userId,
        status: 'active'
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
      }

      subscription.status = 'cancelled';
      subscription.autoRenew = false;
      await subscription.save();

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = planController;