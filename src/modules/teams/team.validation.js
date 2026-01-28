const Joi = require('joi');

const create = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().required().messages({
      'string.min': 'Team name is required',
      'string.max': 'Team name must not exceed 100 characters',
      'any.required': 'Team name is required',
    }),
    description: Joi.string().max(500).trim().allow('', null).messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  }),
};

const update = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid team ID format',
      'any.required': 'Team ID is required',
    }),
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().messages({
      'string.min': 'Team name is required',
      'string.max': 'Team name must not exceed 100 characters',
    }),
    description: Joi.string().max(500).trim().allow('', null).messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  }).min(1).messages({
    'object.min': 'At least one field is required to update',
  }),
};

const getById = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid team ID format',
      'any.required': 'Team ID is required',
    }),
  }),
};

module.exports = {
  create,
  update,
  getById,
};