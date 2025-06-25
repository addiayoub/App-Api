const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuth } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', authController.register);

// @desc    Verify email
// @route   POST /api/auth/verify-email
router.post('/verify-email', authController.verifyEmail);

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
router.post('/resend-verification', authController.resendVerificationEmail);

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', authController.login);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// @desc    Reset password
// @route   POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', (req, res, next) => {
  console.log('=== GOOGLE AUTH INITIATED ===');
  console.log('Request headers:', req.headers);
  next();
}, passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// @desc    Google callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  (req, res, next) => {
    console.log('=== GOOGLE CALLBACK RECEIVED ===');
    console.log('Query params:', req.query);
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/?error=auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      console.log('=== GOOGLE CALLBACK SUCCESS ===');
      console.log('User in req.user:', !!req.user);
      
      if (!req.user) {
        console.log('❌ No user found in req.user');
        return res.redirect(`${process.env.CLIENT_URL}/?error=no_user`);
      }

      console.log('✅ User found:', {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        isVerified: req.user.isVerified
      });

      // Generate JWT token
      const token = req.user.getSignedJwtToken();
      console.log('✅ Token generated:', token ? 'Yes' : 'No');

      // Prepare user data
      const userData = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role || 'user',
        isVerified: req.user.isVerified
      };

      console.log('✅ User data prepared:', userData);

      // Set cookie with proper expiration
      const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE) || 30;
      const expires = new Date();
      expires.setDate(expires.getDate() + cookieExpireDays);
      
      const cookieOptions = {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      };

      console.log('🍪 Setting cookie with options:', cookieOptions);
      res.cookie('token', token, cookieOptions);

      // Encode user data for URL
      const userEncoded = encodeURIComponent(JSON.stringify(userData));
      const redirectUrl = `${process.env.CLIENT_URL}/?token=${token}&user=${userEncoded}&googleAuth=true`;
      
      console.log('🔄 Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/?error=callback_failed`);
    }
  }
);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', ensureAuth, authController.getMe);

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', authController.logout);

module.exports = router;