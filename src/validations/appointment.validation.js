const Joi = require('joi');
const { objectId } = require('./common.validation');

const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

const patientDetailsSchema = Joi.object({
  fullName: Joi.string().trim().max(200).required(),
  email: Joi.string().trim().email().allow('', null),
  phone: Joi.string().trim().max(50).allow('', null),
  dateOfBirth: Joi.date().allow(null),
  gender: Joi.string().trim().max(50).allow('', null),
  bloodType: Joi.string().trim().max(20).allow('', null),
  address: Joi.string().trim().max(500).allow('', null),
  symptoms: Joi.array().items(Joi.string().trim().max(300)).default([]),
  medicalHistory: Joi.array().items(Joi.string().trim().max(300)).default([]),
  allergies: Joi.array().items(Joi.string().trim().max(300)).default([]),
  reasonForVisit: Joi.string().trim().max(1000).allow('', null),
  insurance: Joi.object({
    provider: Joi.string().trim().max(200).allow('', null),
    policyNumber: Joi.string().trim().max(100).allow('', null),
    coverage: Joi.string().trim().max(200).allow('', null),
    validUntil: Joi.date().allow(null),
  }).default({}),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...appointmentStatuses),
  department: objectId,
}).unknown(true);

const createSchema = Joi.object({
  patient: objectId,
  doctor: objectId.required(),
  schedule: objectId.required(),
  room: objectId,
  department: objectId,
  date: Joi.date().required(),
  time: Joi.string().trim().min(1).max(100).required(),
  status: Joi.string().valid(...appointmentStatuses),
  notes: Joi.string().trim().max(2000).allow('', null),
  patientDetails: patientDetailsSchema,
}).unknown(false);

const updateSchema = Joi.object({
  patient: objectId,
  doctor: objectId,
  schedule: objectId,
  room: objectId,
  department: objectId,
  date: Joi.date(),
  time: Joi.string().trim().min(1).max(100),
  status: Joi.string().valid(...appointmentStatuses),
  notes: Joi.string().trim().max(2000).allow('', null),
  patientDetails: patientDetailsSchema,
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
