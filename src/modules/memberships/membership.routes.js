const express = require('express');
const membershipController = require('./membership.controller');
const membershipValidation = require('./membership.validation');
const { validate, sanitize } = require('../../middleware/validation.middleware');
const { isAuthenticated, isTeamAdmin, isTeamMember } = require('../../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(isAuthenticated);

// Add member (admin only)
router.post(
  '/',
  sanitize,
  validate(membershipValidation.addMember),
  isTeamAdmin,
  membershipController.addMember
);

// Update member role (owner only - handled in service)
router.put(
  '/:memberId',
  sanitize,
  validate(membershipValidation.updateRole),
  isTeamMember,
  membershipController.updateRole
);

// Remove member (admin or self)
router.delete(
  '/:memberId',
  validate(membershipValidation.removeMember),
  isTeamMember,
  membershipController.removeMember
);

// Leave team
router.post(
  '/leave',
  validate(membershipValidation.leaveTeam),
  isTeamMember,
  membershipController.leaveTeam
);

module.exports = router;