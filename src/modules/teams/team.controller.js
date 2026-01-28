const teamService = require('./team.service');
const catchAsync = require('../../utils/catchAsync');

/**
 * Create a new team
 * @route POST /api/teams
 */
const create = catchAsync(async (req, res) => {
  const team = await teamService.create(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: { team },
  });
});

/**
 * Get all teams for current user
 * @route GET /api/teams
 */
const getAll = catchAsync(async (req, res) => {
  const teams = await teamService.findByUser(req.user.id);

  res.json({
    success: true,
    data: { teams },
  });
});

/**
 * Get team by ID
 * @route GET /api/teams/:id
 */
const getById = catchAsync(async (req, res) => {
  const team = await teamService.findByIdWithCounts(req.params.id);

  res.json({
    success: true,
    data: { team },
  });
});

/**
 * Update team
 * @route PUT /api/teams/:id
 */
const update = catchAsync(async (req, res) => {
  const team = await teamService.update(req.params.id, req.body, req.user.id);

  res.json({
    success: true,
    message: 'Team updated successfully',
    data: { team },
  });
});

/**
 * Delete team
 * @route DELETE /api/teams/:id
 */
const remove = catchAsync(async (req, res) => {
  await teamService.remove(req.params.id, req.user.id);

  res.json({
    success: true,
    message: 'Team deleted successfully',
  });
});

/**
 * Get team members
 * @route GET /api/teams/:id/members
 */
const getMembers = catchAsync(async (req, res) => {
  const members = await teamService.getMembers(req.params.id);

  res.json({
    success: true,
    data: { members },
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getMembers,
};