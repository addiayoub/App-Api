const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpire: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });

// Middleware de validation personnalisée
UserSchema.pre('validate', function(next) {
  // Si c'est un utilisateur Google, le mot de passe n'est pas requis
  if (this.googleId && !this.password) {
    this.isVerified = true;
  }
  
  // Si c'est un utilisateur normal, le mot de passe est requis
  if (!this.googleId && !this.password && this.isNew) {
    return next(new Error('Password is required for non-Google users'));
  }
  
  next();
});

// Crypter le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  // Ne pas hasher si le mot de passe n'a pas été modifié
  if (!this.isModified('password')) {
    return next();
  }

  // Hasher seulement si un mot de passe existe
  if (this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Mettre à jour lastLogin à chaque connexion
UserSchema.pre('save', function(next) {
  if (this.isModified('lastLogin') || this.isNew) {
    this.lastLogin = new Date();
  }
  next();
});

// Méthode pour générer JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// Méthode pour comparer le mot de passe
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Générer token de réinitialisation de mot de passe
UserSchema.methods.getResetPasswordToken = function() {
  // Générer token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hasher le token et l'assigner au champ resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir l'expiration (1 heure)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

// Générer token de vérification d'email
UserSchema.methods.getEmailVerificationToken = function() {
  // Générer token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Hasher le token et l'assigner au champ emailVerificationToken
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Définir l'expiration (24 heures)
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Méthode pour vérifier si l'utilisateur peut se connecter
UserSchema.methods.canLogin = function() {
  return this.isVerified;
};

// Méthode pour vérifier si c'est un utilisateur Google
UserSchema.methods.isGoogleUser = function() {
  return !!this.googleId;
};

// Méthode pour fusionner avec un compte Google
UserSchema.methods.linkGoogleAccount = function(googleId, avatar) {
  this.googleId = googleId;
  this.isVerified = true;
  if (avatar && !this.avatar) {
    this.avatar = avatar;
  }
  return this.save();
};

// Méthode statique pour trouver ou créer un utilisateur Google
UserSchema.statics.findOrCreateGoogleUser = async function(profile) {
  const email = profile.emails[0].value.toLowerCase().trim();
  const googleId = profile.id;
  const name = profile.displayName;
  const avatar = profile.photos[0]?.value;

  try {
    // Chercher utilisateur existant
    let user = await this.findOne({ email: email });
    
    if (user) {
      // Utilisateur existe, lier Google si nécessaire
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        await user.save();
      }
      return user;
    } else {
      // Créer nouvel utilisateur
      user = new this({
        name: name,
        email: email,
        googleId: googleId,
        avatar: avatar,
        isVerified: true
      });
      
      await user.save();
      return user;
    }
  } catch (error) {
    if (error.code === 11000) {
      // Race condition, récupérer l'utilisateur
      const existingUser = await this.findOne({ email: email });
      if (existingUser && !existingUser.googleId) {
        existingUser.googleId = googleId;
        existingUser.isVerified = true;
        if (avatar && !existingUser.avatar) {
          existingUser.avatar = avatar;
        }
        await existingUser.save();
      }
      return existingUser;
    }
    throw error;
  }
};

// Méthode pour nettoyer les tokens expirés
UserSchema.statics.cleanExpiredTokens = async function() {
  const now = Date.now();
  
  await this.updateMany(
    {
      $or: [
        { emailVerificationExpire: { $lt: now } },
        { resetPasswordExpire: { $lt: now } }
      ]
    },
    {
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpire: 1,
        resetPasswordToken: 1,
        resetPasswordExpire: 1
      }
    }
  );
};

// Méthode pour obtenir les statistiques des utilisateurs
UserSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        googleUsers: { $sum: { $cond: [{ $ne: ['$googleId', null] }, 1, 0] } },
        regularUsers: { $sum: { $cond: [{ $eq: ['$googleId', null] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    verifiedUsers: 0,
    googleUsers: 0,
    regularUsers: 0
  };
};

module.exports = mongoose.model('User', UserSchema);