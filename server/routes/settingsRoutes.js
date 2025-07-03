const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.get('/', ensureAuth, async (req, res) => {
  try {
    res.json({
      name: req.user.name,
      email: req.user.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/', ensureAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = { name, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;