const Joi = require('joi');
const { userRoles } = require('./common.validation');

const addressSchema = Joi.object({
  street: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  state: Joi.string().trim().allow('', null),
  zip: Joi.string().trim().allow('', null),
  country: Joi.string().trim().allow('', null),
});

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid(...userRoles),
  phone: Joi.string().trim().max(30).allow('', null),
  address: addressSchema,
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
