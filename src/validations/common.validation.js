const Joi = require('joi');

/** MongoDB ObjectId dạng chuỗi 24 ký tự hex */
const objectId = Joi.string().hex().length(24);

const userRoles = ['patient', 'doctor', 'admin', 'staff'];

module.exports = {
  objectId,
  userRoles,
  idParamSchema: Joi.object({
    id: objectId.required(),
  }),
};
