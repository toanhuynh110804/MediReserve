const Joi = require('joi');
const { objectId } = require('./common.validation');

const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
const paymentStatuses = ['unpaid', 'paid', 'partial', 'refunded'];

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...appointmentStatuses),
}).unknown(true);

const createSchema = Joi.object({
  patient: objectId,
  doctor: objectId.required(),
  schedule: objectId.required(),
  room: objectId,
  date: Joi.date().required(),
  time: Joi.string().trim().min(1).max(100).required(),
  status: Joi.string().valid(...appointmentStatuses),
  paymentStatus: Joi.string().valid(...paymentStatuses),
  notes: Joi.string().trim().max(2000).allow('', null),
}).unknown(false);

const updateSchema = Joi.object({
  patient: objectId,
  doctor: objectId,
  schedule: objectId,
  room: objectId,
  date: Joi.date(),
  time: Joi.string().trim().min(1).max(100),
  status: Joi.string().valid(...appointmentStatuses),
  paymentStatus: Joi.string().valid(...paymentStatuses),
  notes: Joi.string().trim().max(2000).allow('', null),
})
  .min(1)
  .unknown(false);

const cancelBodySchema = Joi.object({
  cancelReason: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

module.exports = {
  listQuerySchema,
  createSchema,
  updateSchema,
  cancelBodySchema,
};
