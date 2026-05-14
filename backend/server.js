require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { rateLimit } = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.routes');
const eventRoutes = require('./src/routes/event.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const mpesaRoutes = require('./src/routes/mpesa.routes');
const blogRoutes = require('./src/routes/blog.routes');
const userRoutes = require('./src/routes/user.routes');
const contactRoutes = require('./src/routes/contact.routes');
const calendarRoutes = require('./src/routes/calendar.routes');
const payoutRoutes = require('./src/routes/payout.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const newsletterRoutes = require('./src/routes/newsletter.routes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Login: 50 attempts per 15 minutes in development, 10 in production
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Register: 20 per hour in development, 5 in production
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  message: { success: false, message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset: 10 per hour
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many password reset requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// General limiter — completely skipped in development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

// Auth routes — each with its own limiter
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);
app.use('/api/auth', authRoutes);

// All other routes
app.use('/api/events', generalLimiter, eventRoutes);
app.use('/api/bookings', generalLimiter, bookingRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/blog', generalLimiter, blogRoutes);
app.use('/api/users', generalLimiter, userRoutes);
app.use('/api/contact', generalLimiter, contactRoutes);
app.use('/api/calendar', generalLimiter, calendarRoutes);
app.use('/api/payouts', generalLimiter, payoutRoutes);
app.use('/api/settings', generalLimiter, settingsRoutes);
app.use('/api/newsletter', generalLimiter, newsletterRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Jambo Tickets API is running', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Jambo Tickets API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Login limit: ${process.env.NODE_ENV === 'production' ? 10 : 50} attempts per 15 min`);
});

module.exports = app;