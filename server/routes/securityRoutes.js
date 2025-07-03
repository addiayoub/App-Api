const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const SecurityLog = require('../models/SecurityLog');

router.get('/logs', ensureAuth, async (req, res) => {
  try {
    const logs = await SecurityLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;