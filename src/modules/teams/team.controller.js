const teamService = require('./team.service');
const membershipService = require('../memberships/membership.service');
const catchAsync = require('../../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  const team = await teamService.create(req.body, req.user.id);
  res.status(201).json({ success: true, message: 'Team created', data: { team } });
});

const getAll = catchAsync(async (req, res) => {
  const teams = await teamService.findByUser(req.user.id);
  res.json({ success: true, data: { teams } });
});

const getById = catchAsync(async (req, res) => {
  const team = await teamService.findByIdWithCounts(req.params.id);
  res.json({ success: true, data: { team } });
});

const update = catchAsync(async (req, res) => {
  const team = await teamService.update(req.params.id, req.body, req.user.id);
  res.json({ success: true, message: 'Team updated', data: { team } });
});

const remove = catchAsync(async (req, res) => {
  await teamService.remove(req.params.id, req.user.id);
  res.json({ success: true, message: 'Team deleted' });
});

const getMembers = catchAsync(async (req, res) => {
  const members = await teamService.getMembers(req.params.id);
  res.json({ success: true, data: { members } });
});

const updateMemberRole = catchAsync(async (req, res) => {
  // Extract 'id' (Team ID) and 'memberId' (Membership ID)
  const { id, memberId } = req.params;
  const { role } = req.body;
  const requesterId = req.user.id;

  const member = await membershipService.updateRole(id, memberId, role, requesterId);
  res.json({ success: true, message: 'Role updated', data: { member } });
});

const removeMember = catchAsync(async (req, res) => {
  const { id, memberId } = req.params;
  const requesterId = req.user.id;
  await membershipService.removeMember(id, memberId, requesterId);
  res.json({ success: true, message: 'Member removed' });
});

const leaveTeam = catchAsync(async (req, res) => {
  const { id } = req.params; // Team ID
  const userId = req.user.id;

  await membershipService.leaveTeam(userId, id);

  res.json({
    success: true,
    message: 'Successfully left the team',
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getMembers,
  updateMemberRole,
  removeMember,
  leaveTeam,
};