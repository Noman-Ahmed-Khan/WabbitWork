const express = require('express');
const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const { validate, sanitize } = require('../../middleware/validation.middleware');
const { isAuthenticated } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimiter.middleware');

const router = express.Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  sanitize,
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  sanitize,
  validate(authValidation.login),
  authController.login
);

// Check auth status (public)
router.get('/status', authController.getStatus);

// Protected routes
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me', isAuthenticated, authController.getMe);

module.exports = router;