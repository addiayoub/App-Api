require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const apiRoutes = require('./routes/apiRoutes');
const statsRoutes = require('./routes/statsRoutes');
const docsRoutes = require('./routes/docsRoutes');
const securityRoutes = require('./routes/securityRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const configurePassport = require('./config/passport');

const app = express();

connectDB();

configurePassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api', planRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({ 
      success: false,
      message: err.message,
      field: err.field || undefined
    });
  }
  res.status(500).json({ 
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));