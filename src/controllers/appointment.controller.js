const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');

const emitSocketEvent = (req, eventName, payload) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, payload);
  }
};

const isTransactionUnsupported = (error) => {
  return typeof error?.message === 'string' && error.message.includes('Transaction numbers are only allowed on a replica set member or mongos');
};

const withOptionalTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await work(session);
    });
  } catch (error) {
    if (!isTransactionUnsupported(error)) {
      throw error;
    }
    await work(null);
  } finally {
    session.endSession();
  }
};

exports.create = async (req, res) => {
  const data = { ...req.body };
  let appointmentId;

  await withOptionalTransaction(async (session) => {
      const maybeSession = session || undefined;
      if (!data.patient && req.user.role === 'patient') {
        const Patient = require('../models/Patient');
        let patientQuery = Patient.findOne({ user: req.user._id });
        if (maybeSession) patientQuery = patientQuery.session(maybeSession);
        const patient = await patientQuery;
        if (!patient) {
          const err = new Error('Cannot find patient profile');
          err.statusCode = 400;
          throw err;
        }
        data.patient = patient._id;
      }

      let scheduleQuery = Schedule.findById(data.schedule);
      if (maybeSession) scheduleQuery = scheduleQuery.session(maybeSession);
      const schedule = await scheduleQuery;
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

      const appointment = new Appointment(data);
      await appointment.save(maybeSession ? { session: maybeSession } : undefined);
      appointmentId = appointment._id;

      schedule.bookedCount += 1;
      if (schedule.bookedCount >= schedule.capacity) schedule.status = 'closed';
      await schedule.save(maybeSession ? { session: maybeSession } : undefined);
    });

  const appointment = await Appointment.findById(appointmentId).populate('patient doctor schedule room');
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

  const appointments = await Appointment.find(query).populate('patient doctor schedule room');
  res.json(appointments);
};

exports.getById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('patient doctor schedule room');
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  res.json(appointment);
};

exports.updateById = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient doctor schedule room');
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  res.json(appointment);
};

exports.cancel = async (req, res) => {
  await withOptionalTransaction(async (session) => {
      const maybeSession = session || undefined;
      let appointmentQuery = Appointment.findById(req.params.id);
      if (maybeSession) appointmentQuery = appointmentQuery.session(maybeSession);
      const appointment = await appointmentQuery;
      if (!appointment) {
        const err = new Error('Appointment không tồn tại');
        err.statusCode = 404;
        throw err;
      }

      if (appointment.status !== 'cancelled') {
        appointment.status = 'cancelled';
        appointment.cancelReason = req.body.cancelReason || 'Hủy bởi người dùng';
        await appointment.save(maybeSession ? { session: maybeSession } : undefined);

        if (appointment.schedule) {
          let scheduleQuery = Schedule.findById(appointment.schedule);
          if (maybeSession) scheduleQuery = scheduleQuery.session(maybeSession);
          const schedule = await scheduleQuery;
          if (schedule) {
            schedule.bookedCount = Math.max(0, (schedule.bookedCount || 0) - 1);
            if (schedule.status === 'closed' && schedule.bookedCount < schedule.capacity) {
              schedule.status = 'open';
            }
            await schedule.save(maybeSession ? { session: maybeSession } : undefined);
          }
        }
      }
    });

  const appointment = await Appointment.findById(req.params.id).populate('patient doctor schedule room');
  emitSocketEvent(req, 'appointment:cancelled', { appointmentId: appointment._id });
  res.json(appointment);
};
