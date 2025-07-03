const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const ApiRequest = require('../models/ApiRequest');

router.get('/', ensureAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalRequests = await ApiRequest.countDocuments({ userId: req.user.id });
    const monthlyRequests = await ApiRequest.countDocuments({ 
      userId: req.user.id, 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const successRequests = await ApiRequest.countDocuments({ 
      userId: req.user.id, 
      status: { $regex: /^2/ } 
    });

    const successRate = totalRequests > 0 
      ? Math.round((successRequests / totalRequests) * 100) 
      : 0;

    res.json({
      totalRequests,
      monthlyRequests,
      successRate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;