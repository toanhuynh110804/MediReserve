const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');

const appointmentPopulate = [
  {
    path: 'patient',
    populate: { path: 'user' },
  },
  {
    path: 'doctor',
    populate: { path: 'user' },
  },
  'department',
  'schedule',
  'room',
];

const normalizeDetailsList = (items = []) =>
  items
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

const normalizePatientDetails = (details = {}, fallbackUser = null) => ({
  fullName: details.fullName || fallbackUser?.name || '',
  email: details.email || fallbackUser?.email || '',
  phone: details.phone || fallbackUser?.phone || '',
  dateOfBirth: details.dateOfBirth || undefined,
  gender: details.gender || '',
  bloodType: details.bloodType || '',
  address: details.address || '',
  symptoms: normalizeDetailsList(details.symptoms),
  medicalHistory: normalizeDetailsList(details.medicalHistory),
  allergies: normalizeDetailsList(details.allergies),
  reasonForVisit: details.reasonForVisit || '',
  insurance: {
    provider: details.insurance?.provider || '',
    policyNumber: details.insurance?.policyNumber || '',
    coverage: details.insurance?.coverage || '',
    validUntil: details.insurance?.validUntil || undefined,
  },
});

const emitSocketEvent = (req, eventName, payload) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, payload);
  }
};

exports.create = async (req, res) => {
  const data = { ...req.body };
  const session = await mongoose.startSession();
  let appointmentId;

  try {
    await session.withTransaction(async () => {
      if (!data.patient && req.user.role === 'patient') {
        const Patient = require('../models/Patient');
        const patient = await Patient.findOne({ user: req.user._id }).populate('user').session(session);
        if (!patient) {
          const err = new Error('Cannot find patient profile');
          err.statusCode = 400;
          throw err;
        }
        if (!data.patientDetails) {
          const err = new Error('Thiếu thông tin chi tiết bệnh nhân cho lịch hẹn');
          err.statusCode = 400;
          throw err;
        }
        data.patient = patient._id;

        const patientDetails = normalizePatientDetails(data.patientDetails, patient.user);
        data.patientDetails = patientDetails;

        patient.dateOfBirth = patientDetails.dateOfBirth || patient.dateOfBirth;
        patient.gender = patientDetails.gender || patient.gender;
        patient.bloodType = patientDetails.bloodType || patient.bloodType;
        patient.medicalHistory = patientDetails.medicalHistory;
        patient.allergies = patientDetails.allergies;
        patient.insurance = {
          ...patient.insurance?.toObject?.(),
          provider: patientDetails.insurance.provider,
          policyNumber: patientDetails.insurance.policyNumber,
          coverage: patientDetails.insurance.coverage,
          validUntil: patientDetails.insurance.validUntil || undefined,
        };

        if (patient.user) {
          patient.user.name = patientDetails.fullName || patient.user.name;
          patient.user.email = patientDetails.email || patient.user.email;
          patient.user.phone = patientDetails.phone || patient.user.phone;
          if (patientDetails.address) {
            patient.user.address = {
              ...(patient.user.address?.toObject?.() || patient.user.address || {}),
              street: patientDetails.address,
            };
          }
          await patient.user.save({ session });
        }

        await patient.save({ session });
      } else if (data.patientDetails) {
        data.patientDetails = normalizePatientDetails(data.patientDetails);
      }

      const schedule = await Schedule.findById(data.schedule).session(session);
      if (!schedule || schedule.status !== 'open') {
        const err = new Error('Schedule không hợp lệ');
        err.statusCode = 400;
        throw err;
      }
      if (schedule.bookedCount >= schedule.capacity) {
        const err = new Error('Slot đã đầy');
        err.statusCode = 400;
        throw err;
      }

      const departmentId = schedule.department || data.department;
      data.department = departmentId;

      const appointment = new Appointment(data);
      await appointment.save({ session });
      appointmentId = appointment._id;

      schedule.bookedCount += 1;
      if (schedule.bookedCount >= schedule.capacity) schedule.status = 'closed';
      await schedule.save({ session });
    });
  } finally {
    session.endSession();
  }

  const appointment = await Appointment.findById(appointmentId).populate(appointmentPopulate);
  emitSocketEvent(req, 'appointment:created', { appointmentId: appointment._id });

  res.status(201).json(appointment);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.user.role === 'patient') {
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Bệnh nhân không tìm thấy' });
    query.patient = patient._id;
  }
  if (req.user.role === 'doctor') {
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Bác sĩ không tìm thấy' });
    query.doctor = doctor._id;
  }
  if (req.query.status) query.status = req.query.status;
  if (req.query.department) query.department = req.query.department;

  const appointments = await Appointment.find(query).populate(appointmentPopulate);
  res.json(appointments);
};

exports.getById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulate);
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  res.json(appointment);
};

exports.updateById = async (req, res) => {
  const updateData = { ...req.body };
  if (updateData.patientDetails) {
    updateData.patientDetails = normalizePatientDetails(updateData.patientDetails);
  }

  const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate(appointmentPopulate);
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  res.json(appointment);
};

exports.cancel = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(req.params.id).session(session);
      if (!appointment) {
        const err = new Error('Appointment không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      if (appointment.status !== 'cancelled') {
        appointment.status = 'cancelled';
        appointment.cancelReason = req.body.cancelReason || 'Hủy bởi người dùng';
        await appointment.save({ session });

        if (appointment.schedule) {
          const schedule = await Schedule.findById(appointment.schedule).session(session);
          if (schedule) {
            schedule.bookedCount = Math.max(0, (schedule.bookedCount || 0) - 1);
            if (schedule.status === 'closed' && schedule.bookedCount < schedule.capacity) {
              schedule.status = 'open';
            }
            await schedule.save({ session });
          }
        }
      }
    });
  } finally {
    session.endSession();
  }

  const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulate);
  emitSocketEvent(req, 'appointment:cancelled', { appointmentId: appointment._id });
  res.json(appointment);
};
