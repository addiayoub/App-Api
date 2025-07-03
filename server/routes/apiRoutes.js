const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const ApiKey = require('../models/ApiKey');

router.get('/keys', ensureAuth, async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/keys', ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = new ApiKey({
      userId: req.user.id,
      name,
      key
    });

    await apiKey.save();
    res.status(201).json(apiKey);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/keys/:id', ensureAuth, async (req, res) => {
  try {
    const key = await ApiKey.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!key) return res.status(404).json({ success: false, message: 'Key not found' });
    res.json({ success: true, message: 'Key revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;