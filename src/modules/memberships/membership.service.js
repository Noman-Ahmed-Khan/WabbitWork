const MembershipModel = require('./membership.model');
const userService = require('../users/user.service');
const ApiError = require('../../utils/ApiError');
const { MEMBERSHIP_ROLE, MEMBERSHIP_STATUS } = require('../../utils/constants');

// Create a new membership
const create = async (membershipData) => {
  // Check if membership already exists
  const existing = await MembershipModel.findByUserAndTeam(
    membershipData.user_id,
    membershipData.team_id
  );

  if (existing) {
    if (existing.status === MEMBERSHIP_STATUS.ACTIVE) {
      throw ApiError.conflict('User is already a member of this team');
    }
    // Reactivate if previously inactive
    return MembershipModel.update(existing.id, {
      status: MEMBERSHIP_STATUS.ACTIVE,
      role: membershipData.role || MEMBERSHIP_ROLE.MEMBER,
    });
  }

  return MembershipModel.create(membershipData);
};

// Find membership by user and team
const findByUserAndTeam = async (userId, teamId) => {
  return MembershipModel.findByUserAndTeam(userId, teamId);
};

// Find all memberships for a user
const findByUser = async (userId) => {
  return MembershipModel.findByUser(userId);
};

// Find all members of a team
const findByTeam = async (teamId) => {
  return MembershipModel.findByTeam(teamId);
};

// Add member to team
const addMember = async (teamId, email, role, inviterId) => {
  // Find user by email
  const user = await userService.findByEmail(email);
  if (!user) {
    throw ApiError.notFound('User not found with this email');
  }

  // Check if inviter has permission
  const inviterMembership = await findByUserAndTeam(inviterId, teamId);
  if (!inviterMembership || ![MEMBERSHIP_ROLE.OWNER, MEMBERSHIP_ROLE.ADMIN].includes(inviterMembership.role)) {
    throw ApiError.forbidden('You do not have permission to add members');
  }

  // Cannot add owner role
  if (role === MEMBERSHIP_ROLE.OWNER) {
    throw ApiError.forbidden('Cannot assign owner role');
  }

  return create({
    user_id: user.id,
    team_id: teamId,
    role: role || MEMBERSHIP_ROLE.MEMBER,
    invited_email: email,
  });
};

//Update member role
const updateRole = async (membershipId, newRole, updaterId, teamId) => {
  const membership = await MembershipModel.findById(membershipId);
  if (!membership) {
    throw ApiError.notFound('Membership not found');
  }

  // Check if updater has permission
  const updaterMembership = await findByUserAndTeam(updaterId, teamId);
  if (!updaterMembership || updaterMembership.role !== MEMBERSHIP_ROLE.OWNER) {
    throw ApiError.forbidden('Only team owner can change member roles');
  }

  // Cannot change owner role
  if (membership.role === MEMBERSHIP_ROLE.OWNER) {
    throw ApiError.forbidden('Cannot change owner role');
  }

  // Cannot assign owner role
  if (newRole === MEMBERSHIP_ROLE.OWNER) {
    throw ApiError.forbidden('Cannot assign owner role');
  }

  return MembershipModel.update(membershipId, { role: newRole });
};

// Remove member from team
const removeMember = async (membershipId, removerId, teamId) => {
  const membership = await MembershipModel.findById(membershipId);
  if (!membership) {
    throw ApiError.notFound('Membership not found');
  }

  // Check if it's the owner
  if (membership.role === MEMBERSHIP_ROLE.OWNER) {
    throw ApiError.forbidden('Cannot remove team owner');
  }

  // Check if remover has permission (owner, admin, or self)
  const removerMembership = await findByUserAndTeam(removerId, teamId);
  const isSelf = membership.user_id === removerId;
  const hasPermission = removerMembership && 
    [MEMBERSHIP_ROLE.OWNER, MEMBERSHIP_ROLE.ADMIN].includes(removerMembership.role);

  if (!isSelf && !hasPermission) {
    throw ApiError.forbidden('You do not have permission to remove this member');
  }

  await MembershipModel.delete(membershipId);
  return { message: 'Member removed successfully' };
};

// Leave team
const leaveTeam = async (userId, teamId) => {
  const membership = await findByUserAndTeam(userId, teamId);
  if (!membership) {
    throw ApiError.notFound('You are not a member of this team');
  }

  if (membership.role === MEMBERSHIP_ROLE.OWNER) {
    throw ApiError.forbidden('Team owner cannot leave. Transfer ownership or delete the team.');
  }

  await MembershipModel.deleteByUserAndTeam(userId, teamId);
  return { message: 'Successfully left the team' };
};

module.exports = {
  create,
  findByUserAndTeam,
  findByUser,
  findByTeam,
  addMember,
  updateRole,
  removeMember,
  leaveTeam,
};