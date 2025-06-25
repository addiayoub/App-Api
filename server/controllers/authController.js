const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../config/email');

const sendTokenResponse = (user, statusCode, res, message = 'Succès') => {
  const token = user.getSignedJwtToken();

  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE) || 30;
  const expires = new Date();
  expires.setDate(expires.getDate() + cookieExpireDays);

  const options = {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // Définir le cookie D'ABORD
  res.cookie('token', token, options);

  // Ensuite envoyer la réponse JSON
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified
    }
  });
};

// INSCRIPTION NORMALE
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return next(new ErrorResponse('Un utilisateur avec cet email existe déjà', 400));
    }

    // Créer l'utilisateur avec gestion d'erreur de duplication
    try {
      user = new User({
        name,
        email: normalizedEmail,
        password,
        isVerified: false
      });

      const verificationToken = user.getEmailVerificationToken();
      await user.save();

      try {
        await sendVerificationEmail(user, verificationToken);
        
        res.status(201).json({
          success: true,
          message: 'Utilisateur créé avec succès. Veuillez vérifier votre email.',
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
          }
        });
      } catch (emailError) {
        await User.findByIdAndDelete(user._id);
        return next(new ErrorResponse('Erreur lors de l\'envoi de l\'email de vérification', 500));
      }

    } catch (saveError) {
      if (saveError.code === 11000) {
        return next(new ErrorResponse('Un utilisateur avec cet email existe déjà', 400));
      }
      throw saveError;
    }

  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
};

// CONNEXION NORMALE
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    console.log('User verified:', user.isVerified);
    console.log('User has password:', !!user.password);

    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(401).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter'
      });
    }

    if (!user.password) {
      console.log('User has no password (Google account)');
      return res.status(401).json({
        success: false,
        message: 'Veuillez utiliser la connexion Google'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    console.log('Login successful');
    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

// AUTHENTIFICATION GOOGLE
exports.googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    
    if (!googleId || !email || !name) {
      return next(new ErrorResponse('Données Google incomplètes', 400));
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Chercher si un utilisateur existe avec cet email
    let user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      // Utilisateur existe déjà
      if (user.googleId) {
        // Utilisateur a déjà un compte Google
        if (user.googleId === googleId) {
          // Même utilisateur Google
          return sendTokenResponse(user, 200, res, 'Connexion Google réussie');
        } else {
          // Différent googleId
          return next(new ErrorResponse('Cet email est associé à un autre compte Google', 400));
        }
      } else {
        // Utilisateur créé via inscription normale, lier à Google
        user.googleId = googleId;
        user.isVerified = true;
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        
        await user.save();
        return sendTokenResponse(user, 200, res, 'Compte Google lié avec succès');
      }
    } else {
      // Créer nouvel utilisateur Google
      try {
        user = new User({
          name,
          email: normalizedEmail,
          googleId,
          avatar,
          isVerified: true
        });
        
        await user.save();
        return sendTokenResponse(user, 201, res, 'Compte Google créé avec succès');
        
      } catch (saveError) {
        if (saveError.code === 11000) {
          // Race condition
          user = await User.findOne({ email: normalizedEmail });
          if (user) {
            if (!user.googleId) {
              user.googleId = googleId;
              user.isVerified = true;
              if (avatar && !user.avatar) {
                user.avatar = avatar;
              }
              await user.save();
            }
            return sendTokenResponse(user, 200, res, 'Connexion Google réussie');
          }
        }
        throw saveError;
      }
    }
    
  } catch (err) {
    console.error('Google Auth Error:', err);
    next(new ErrorResponse('Erreur lors de l\'authentification Google', 500));
  }
};

// CALLBACK GOOGLE (pour Passport)
// Dans authController.js, remplacez la méthode googleCallback :

exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      console.log('No user in req.user');
      return res.redirect(`${process.env.CLIENT_URL}/?error=no_user`);
    }

    console.log('Google callback - User found:', req.user.email);

    const token = req.user.getSignedJwtToken();
    
    // Préparer les données utilisateur (sans le mot de passe)
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role || 'user',
      isVerified: req.user.isVerified
    };

    console.log('Redirecting with token and user data');

    // Rediriger avec le token ET les données utilisateur
    const userEncoded = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userEncoded}`);

  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/?error=callback_failed`);
  }
};

// VÉRIFICATION EMAIL
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de vérification requis'
      });
    }

    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de vérification invalide ou expiré'
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res, 'Email vérifié avec succès');
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification'
    });
  }
};

// RENVOYER EMAIL DE VÉRIFICATION
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return next(new ErrorResponse('Aucun utilisateur trouvé avec cet email', 404));
    }

    if (user.isVerified) {
      return next(new ErrorResponse('Cet email est déjà vérifié', 400));
    }

    const verificationToken = user.getEmailVerificationToken();
    await user.save();
    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Email de vérification renvoyé avec succès'
    });

  } catch (err) {
    next(err);
  }
};

// MOT DE PASSE OUBLIÉ
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return next(new ErrorResponse('Aucun utilisateur trouvé avec cet email', 404));
    }

    if (!user.password && user.googleId) {
      return next(new ErrorResponse('Cet utilisateur utilise Google OAuth. Utilisez la connexion Google.', 400));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    try {
      await sendResetPasswordEmail(user, resetToken);

      res.status(200).json({
        success: true,
        message: 'Email de réinitialisation envoyé avec succès'
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return next(new ErrorResponse('Erreur lors de l\'envoi de l\'email', 500));
    }

  } catch (err) {
    next(err);
  }
};

// RÉINITIALISER MOT DE PASSE
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new ErrorResponse('Token et nouveau mot de passe requis', 400));
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Token de réinitialisation invalide ou expiré', 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res, 'Mot de passe réinitialisé avec succès');

  } catch (err) {
    next(err);
  }
};

// OBTENIR PROFIL UTILISATEUR
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// DÉCONNEXION
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};