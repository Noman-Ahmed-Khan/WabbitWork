const Joi = require('joi');
const { MEMBERSHIP_ROLE } = require('../../utils/constants');

const create = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().required(),
    description: Joi.string().max(500).trim().allow('', null),
  }),
};

const update = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(100).trim(),
    description: Joi.string().max(500).trim().allow('', null),
  }).min(1),
};

const getById = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const updateMemberRole = {
  params: Joi.object({
    id: Joi.string().uuid().required().label('Team ID'),
    memberId: Joi.string().uuid().required().label('Membership ID'),
  }),
  body: Joi.object({
    // FIX: Allow both lowercase and uppercase roles
    role: Joi.string()
      .valid(
        'admin', 'member', 'owner',
        'ADMIN', 'MEMBER', 'OWNER'
      )
      .required(),
  }),
};

const removeMember = {
  params: Joi.object({
    id: Joi.string().uuid().required().label('Team ID'),
    memberId: Joi.string().uuid().required().label('Membership ID'),
  }),
};

module.exports = {
  create,
  update,
  getById,
  updateMemberRole,
  removeMember,
};