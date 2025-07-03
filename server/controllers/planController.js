const { default: axios } = require('axios');
const { sendApiTokenEmail } = require('../config/email');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User'); // Ajout de l'import User

const planController = {
  getAllPlans: async (req, res) => {
    try {
      const plans = await Plan.find({ active: true }).sort({ monthlyPrice: 1 });
      
      // Pour chaque plan, récupérer les utilisateurs avec une souscription active
      const plansWithUsers = await Promise.all(
        plans.map(async (plan) => {
          // Récupérer les souscriptions actives pour ce plan
          const subscriptions = await Subscription.find({
            planId: plan._id,
            status: 'active'
          }).populate('userId', 'name email avatar createdAt lastLogin');
          
          // Extraire les informations des utilisateurs
          const users = subscriptions.map(sub => ({
            id: sub.userId._id,
            name: sub.userId.name,
            email: sub.userId.email,
            avatar: sub.userId.avatar,
            subscriptionId: sub._id,
            billingType: sub.billingType,
            price: sub.price,
            startDate: sub.startDate,
            expiresAt: sub.expiresAt,
            autoRenew: sub.autoRenew,
            userCreatedAt: sub.userId.createdAt,
            lastLogin: sub.userId.lastLogin
          }));
          
          return {
            ...plan.toObject(),
            users: users,
            totalUsers: users.length
          };
        })
      );
      
      res.json({
        success: true,
        data: plansWithUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Méthode pour récupérer un plan avec ses utilisateurs
  getPlanWithUsers: async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await Plan.findById(id);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }
      
      // Récupérer les souscriptions actives pour ce plan
      const subscriptions = await Subscription.find({
        planId: id,
        status: 'active'
      }).populate('userId', 'name email avatar createdAt lastLogin role');
      
      // Statistiques des utilisateurs
      const userStats = {
        total: subscriptions.length,
        byBillingType: {
          monthly: subscriptions.filter(sub => sub.billingType === 'monthly').length,
          annual: subscriptions.filter(sub => sub.billingType === 'annual').length
        },
        totalRevenue: subscriptions.reduce((sum, sub) => sum + sub.price, 0),
        monthlyRevenue: subscriptions
          .filter(sub => sub.billingType === 'monthly')
          .reduce((sum, sub) => sum + sub.price, 0),
        annualRevenue: subscriptions
          .filter(sub => sub.billingType === 'annual')
          .reduce((sum, sub) => sum + sub.price, 0)
      };
      
      const users = subscriptions.map(sub => ({
        id: sub.userId._id,
        name: sub.userId.name,
        email: sub.userId.email,
        avatar: sub.userId.avatar,
        role: sub.userId.role,
        subscriptionId: sub._id,
        billingType: sub.billingType,
        price: sub.price,
        startDate: sub.startDate,
        expiresAt: sub.expiresAt,
        autoRenew: sub.autoRenew,
        userCreatedAt: sub.userId.createdAt,
        lastLogin: sub.userId.lastLogin,
        daysUntilExpiration: Math.ceil((sub.expiresAt - new Date()) / (1000 * 60 * 60 * 24))
      }));
      
      res.json({
        success: true,
        data: {
          plan: plan,
          users: users,
          stats: userStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Méthode pour récupérer les statistiques des plans
  getPlanStats: async (req, res) => {
    try {
      const planStats = await Plan.aggregate([
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'planId',
            pipeline: [
              { $match: { status: 'active' } }
            ],
            as: 'activeSubscriptions'
          }
        },
        {
          $addFields: {
            totalUsers: { $size: '$activeSubscriptions' },
            totalRevenue: { $sum: '$activeSubscriptions.price' },
            monthlySubscriptions: {
              $size: {
                $filter: {
                  input: '$activeSubscriptions',
                  cond: { $eq: ['$$this.billingType', 'monthly'] }
                }
              }
            },
            annualSubscriptions: {
              $size: {
                $filter: {
                  input: '$activeSubscriptions',
                  cond: { $eq: ['$$this.billingType', 'annual'] }
                }
              }
            }
          }
        },
        {
          $project: {
            name: 1,
            monthlyPrice: 1,
            annualPrice: 1,
            features: 1,
            totalUsers: 1,
            totalRevenue: 1,
            monthlySubscriptions: 1,
            annualSubscriptions: 1,
            active: 1
          }
        },
        {
          $sort: { monthlyPrice: 1 }
        }
      ]);
      
      res.json({
        success: true,
        data: planStats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updatePlan: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPlan = await Plan.findByIdAndUpdate(
        id,
        req.body,
        { 
          new: true,
          runValidators: true
        }
      );

      if (!updatedPlan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      res.json({
        success: true,
        data: updatedPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  createPlan: async (req, res) => {
    try {
      const newPlan = new Plan(req.body);
      await newPlan.save();
      
      res.status(201).json({
        success: true,
        data: newPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  deletePlan: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier s'il y a des souscriptions actives
      const activeSubscriptions = await Subscription.countDocuments({
        planId: id,
        status: 'active'
      });
      
      if (activeSubscriptions > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete plan with ${activeSubscriptions} active subscriptions. Please cancel all subscriptions first.`
        });
      }
      
      const deletedPlan = await Plan.findByIdAndDelete(id);

      if (!deletedPlan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      res.json({
        success: true,
        message: 'Plan deleted successfully'
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
// Méthode pour générer un nouveau token API
// Méthode pour générer un nouveau token API avec la même date d'expiration
generateNewUserToken: async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Trouver l'abonnement actif
    const subscription = await Subscription.findOne({
      userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found for this user'
      });
    }

    // Trouver le plan associé
    const plan = await Plan.findById(subscription.planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Générer un nouveau token API avec la même date d'expiration
    const tokenResponse = await axios.post(
      'https://apiservice.insightone.ma/api/tunnel/admin/create_user_token',
      {
        id: userId.toString(),
        plan: plan.name,
        expires_at: subscription.expiresAt.toISOString() // Conserver la même date
      },
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    // Envoyer le nouveau token par email (sans mention de nouvelle date d'expiration)
    await sendApiTokenEmail({
      email: user.email,
      name: user.name,
      plan: plan.name,
      token: access_token,
      expiresAt: subscription.expiresAt.toLocaleDateString('fr-FR'),
      isNewToken: true,
      keepSameExpiration: true // Nouveau paramètre
    });

    res.json({
      success: true,
      message: 'New API token generated successfully',
      data: {
        tokenGeneratedAt: new Date(),
        expiresAt: subscription.expiresAt // Renvoyer la date originale
      }
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

      // Générer le token API
      try {
        const tokenResponse = await axios.post(
          'https://apiservice.insightone.ma/api/tunnel/admin/create_user_token',
          {
            id: userId.toString(),
            plan: plan.name,
            expires_at: expiresAt.toISOString()
          },
          {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const { access_token, plan: apiPlan } = tokenResponse.data;

        // Envoyer le token par email
        await sendApiTokenEmail({
          email: req.user.email,
          name: req.user.name,
          plan: apiPlan,
          token: access_token,
          expiresAt: expiresAt.toLocaleDateString('fr-FR')
        });

      } catch (apiError) {
        console.error('Error generating API token:', apiError.message);
        // Ne pas échouer la requête même si l'appel API échoue
      }

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
  
  updateUserSubscription: async (req, res) => {
    try {
      const { userId, subscriptionId } = req.params;
      const { action } = req.body; // 'activate', 'deactivate', 'cancel'

      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Trouver l'abonnement
      const subscription = await Subscription.findOne({
        _id: subscriptionId,
        userId: userId
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Gérer les différentes actions
      switch (action) {
        case 'activate':
          if (subscription.status === 'active') {
            return res.status(400).json({
              success: false,
              message: 'Subscription is already active'
            });
          }
          subscription.status = 'active';
          subscription.autoRenew = true;
          break;

        case 'deactivate':
          if (subscription.status !== 'active') {
            return res.status(400).json({
              success: false,
              message: 'Only active subscriptions can be deactivated'
            });
          }
          subscription.status = 'inactive';
          subscription.autoRenew = false;
          break;

        case 'cancel':
          subscription.status = 'cancelled';
          subscription.autoRenew = false;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }

      await subscription.save();

      // Mettre à jour le token API si nécessaire
      if (action === 'activate' || action === 'cancel') {
        try {
          await axios.post(
            'https://apiservice.insightone.ma/api/tunnel/admin/update_user_token',
            {
              id: userId.toString(),
              status: action === 'activate' ? 'active' : 'revoked'
            },
            {
              headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (apiError) {
          console.error('Error updating API token:', apiError.message);
        }
      }

      res.json({
        success: true,
        message: `Subscription ${action}d successfully`,
        data: subscription
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