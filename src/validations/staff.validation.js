const Joi = require('joi');
const { objectId } = require('./common.validation');

const createStaffSchema = Joi.object({
  user: objectId.required().messages({
    'any.required': 'Vui lòng chọn tài khoản user cho nhân viên.',
  }),
  department: objectId.required().messages({
    'any.required': 'Nhân viên phải được chỉ định vào một khoa.',
  }),
  hospital: objectId.allow('', null),
  title: Joi.string().trim().max(200).allow('', null),
  role: Joi.string().valid('staff', 'manager', 'admin').default('staff'),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

const updateStaffSchema = Joi.object({
  user: objectId,
  department: objectId.required().messages({
    'any.required': 'Nhân viên phải được chỉ định vào một khoa.',
  }),
  hospital: objectId.allow('', null),
  title: Joi.string().trim().max(200).allow('', null),
  role: Joi.string().valid('staff', 'manager', 'admin'),
  status: Joi.string().valid('active', 'inactive'),
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
};
