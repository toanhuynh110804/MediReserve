const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const roleRoutes = require('./routes/role.route');
const specialtyRoutes = require('./routes/specialty.route');
const hospitalRoutes = require('./routes/hospital.route');
const departmentRoutes = require('./routes/department.route');
const doctorRoutes = require('./routes/doctor.route');
const patientRoutes = require('./routes/patient.route');
const scheduleRoutes = require('./routes/schedule.route');
const appointmentRoutes = require('./routes/appointment.route');
const medicalRecordRoutes = require('./routes/medicalRecord.route');
const prescriptionRoutes = require('./routes/prescription.route');
const invoiceRoutes = require('./routes/invoice.route');
const paymentRoutes = require('./routes/payment.route');
const reviewRoutes = require('./routes/review.route');
const testRoutes = require('./routes/test.route');
const testResultRoutes = require('./routes/testResult.route');
const notificationRoutes = require('./routes/notification.route');
const fileUploadRoutes = require('./routes/fileUpload.route');
const staffRoutes = require('./routes/staff.route');
const ratingRoutes = require('./routes/rating.route');
const addressRoutes = require('./routes/address.route');
const medicineRoutes = require('./routes/medicine.route');
const insuranceRoutes = require('./routes/insurance.route');

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'MediReserve API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/insurances', insuranceRoutes);

app.use(errorMiddleware);

module.exports = app;
