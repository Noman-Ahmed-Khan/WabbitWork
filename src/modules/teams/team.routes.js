const express = require('express');
const teamController = require('./team.controller');
const teamValidation = require('./team.validation');
const { validate, sanitize } = require('../../middleware/validation.middleware');
const { isAuthenticated, isTeamMember, isTeamOwner } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Team CRUD routes
router.post(
  '/',
  sanitize,
  validate(teamValidation.create),
  teamController.create
);

router.get('/', teamController.getAll);

router.get(
  '/:id',
  validate(teamValidation.getById),
  isTeamMember,
  teamController.getById
);

router.put(
  '/:id',
  sanitize,
  validate(teamValidation.update),
  isTeamOwner,
  teamController.update
);

router.delete(
  '/:id',
  validate(teamValidation.getById),
  isTeamOwner,
  teamController.remove
);

// Team members
router.get(
  '/:id/members',
  validate(teamValidation.getById),
  isTeamMember,
  teamController.getMembers
);

module.exports = router;