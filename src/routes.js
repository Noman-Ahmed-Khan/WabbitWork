const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const teamRoutes = require('./modules/teams/team.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const membershipRoutes = require('./modules/memberships/membership.routes');
const taskController = require('./modules/tasks/task.controller');
const taskValidation = require('./modules/tasks/task.validation');
const { validate } = require('./middleware/validation.middleware');
const { isAuthenticated, isTeamMember } = require('./middleware/auth.middleware');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Team routes
router.use('/teams', teamRoutes);

// Task routes
router.use('/tasks', taskRoutes);

// Nested routes: Team members
router.use('/teams/:teamId/members', membershipRoutes);

// Nested routes: Team tasks
router.get(
  '/teams/:teamId/tasks',
  isAuthenticated,
  validate(taskValidation.getByTeam),
  isTeamMember,
  taskController.getByTeam
);

module.exports = router;