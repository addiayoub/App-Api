const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  // Google Strategy
 // passport.js
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value.toLowerCase().trim();
      
      // Chercher par googleId ou email
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: email }
        ]
      });

      if (!user) {
        // Créer nouvel utilisateur
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          avatar: profile.photos[0]?.value,
          isVerified: true
        });
      } else if (!user.googleId) {
        // Lier compte existant à Google
        user.googleId = profile.id;
        user.isVerified = true;
        if (profile.photos[0]?.value && !user.avatar) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

  // Local Strategy
  passport.use(new LocalStrategy({ usernameField: 'email' }, 
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          return done(null, false, { message: 'Email not registered' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Please use Google login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialization
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};