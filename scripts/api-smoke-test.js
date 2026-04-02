const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ override: true });

const app = require('../src/app');
const connectDB = require('../src/config/db');
const Address = require('../src/models/Address');
const Appointment = require('../src/models/Appointment');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const FileUpload = require('../src/models/FileUpload');
const Hospital = require('../src/models/Hospital');
const Insurance = require('../src/models/Insurance');
const Invoice = require('../src/models/Invoice');
const MedicalRecord = require('../src/models/MedicalRecord');
const Medicine = require('../src/models/Medicine');
const Notification = require('../src/models/Notification');
const Patient = require('../src/models/Patient');
const Payment = require('../src/models/Payment');
const Prescription = require('../src/models/Prescription');
const Rating = require('../src/models/Rating');
const Review = require('../src/models/Review');
const Role = require('../src/models/Role');
const Room = require('../src/models/Room');
const Schedule = require('../src/models/Schedule');
const Specialty = require('../src/models/Specialty');
const Staff = require('../src/models/Staff');
const TestModel = require('../src/models/Test');
const TestResult = require('../src/models/TestResult');
const User = require('../src/models/User');

const tag = `smoke-${Date.now()}`;
const password = 'secret12';
const cleanupIds = {
  Address: [],
  Appointment: [],
  Department: [],
  Doctor: [],
  FileUpload: [],
  Hospital: [],
  Insurance: [],
  Invoice: [],
  MedicalRecord: [],
  Medicine: [],
  Notification: [],
  Patient: [],
  Payment: [],
  Prescription: [],
  Rating: [],
  Review: [],
  Role: [],
  Room: [],
  Schedule: [],
  Specialty: [],
  Staff: [],
  Test: [],
  TestResult: [],
  User: [],
};
const results = [];

const modelsByName = {
  Address,
  Appointment,
  Department,
  Doctor,
  FileUpload,
  Hospital,
  Insurance,
  Invoice,
  MedicalRecord,
  Medicine,
  Notification,
  Patient,
  Payment,
  Prescription,
  Rating,
  Review,
  Role,
  Room,
  Schedule,
  Specialty,
  Staff,
  Test: TestModel,
  TestResult,
  User,
};

function track(modelName, value) {
  if (!value) return;
  cleanupIds[modelName].push(String(value));
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function asId(doc) {
  return String(doc && (doc._id || doc.id || doc));
}

function uniqueEmail(prefix) {
  return `${prefix}.${tag}@example.com`;
}

function uniqueName(prefix) {
  return `${prefix}-${tag}`;
}

async function startServer() {
  await connectDB();
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
    server.on('error', reject);
  });
}

async function request(baseUrl, method, path, { token, body, query } = {}) {
  const url = new URL(path, baseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = text;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }

  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}

async function runStep(name, fn) {
  try {
    const value = await fn();
    results.push({ name, ok: true });
    return value;
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
    return undefined;
  }
}

function assertStatus(response, allowed, context) {
  const ok = allowed.includes(response.status);
  if (!ok) {
    throw new Error(`${context} expected ${allowed.join('/')} but got ${response.status}: ${JSON.stringify(response.data)}`);
  }
}

async function cleanup() {
  const order = [
    'Notification',
    'FileUpload',
    'Payment',
    'Invoice',
    'Prescription',
    'TestResult',
    'MedicalRecord',
    'Review',
    'Rating',
    'Appointment',
    'Schedule',
    'Insurance',
    'Staff',
    'Doctor',
    'Patient',
    'Room',
    'Address',
    'Medicine',
    'Test',
    'Department',
    'Hospital',
    'Specialty',
    'Role',
    'User',
  ];

  for (const modelName of order) {
    const ids = [...new Set(cleanupIds[modelName])];
    if (!ids.length) continue;
    await modelsByName[modelName].deleteMany({ _id: { $in: ids } });
  }
}

async function createDbUser(name, role) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: uniqueEmail(name.toLowerCase()),
    password: hashed,
    role,
  });
  track('User', user._id);
  return user;
}

async function main() {
  let server;
  try {
    const started = await startServer();
    server = started.server;
    const baseUrl = started.baseUrl;
    const state = {};

    const health = await runStep('GET /', async () => {
      const response = await request(baseUrl, 'GET', '/');
      assertStatus(response, [200], 'GET /');
      expect(response.data && response.data.success === true, 'Health response missing success=true');
    });

    const adminRegister = await runStep('POST /api/auth/register admin', async () => {
      const response = await request(baseUrl, 'POST', '/api/auth/register', {
        body: {
          name: uniqueName('admin'),
          email: uniqueEmail('admin'),
          password,
          role: 'admin',
          phone: '0900000001',
        },
      });
      assertStatus(response, [201], 'POST /api/auth/register admin');
      track('User', response.data.user.id);
      state.adminToken = response.data.token;
      state.adminUserId = response.data.user.id;
    });

    await runStep('POST /api/auth/login admin', async () => {
      const response = await request(baseUrl, 'POST', '/api/auth/login', {
        body: {
          email: uniqueEmail('admin'),
          password,
        },
      });
      assertStatus(response, [200], 'POST /api/auth/login admin');
      state.adminToken = response.data.token;
    });

    await runStep('GET /api/auth/profile admin', async () => {
      const response = await request(baseUrl, 'GET', '/api/auth/profile', { token: state.adminToken });
      assertStatus(response, [200], 'GET /api/auth/profile admin');
      expect(response.data.user.email === uniqueEmail('admin'), 'Admin profile email mismatch');
    });

    await runStep('POST /api/auth/register patient', async () => {
      const response = await request(baseUrl, 'POST', '/api/auth/register', {
        body: {
          name: uniqueName('patient'),
          email: uniqueEmail('patient'),
          password,
          role: 'patient',
          phone: '0900000002',
        },
      });
      assertStatus(response, [201], 'POST /api/auth/register patient');
      track('User', response.data.user.id);
      state.patientToken = response.data.token;
      state.patientUserId = response.data.user.id;
    });

    await runStep('POST /api/auth/register doctor', async () => {
      const response = await request(baseUrl, 'POST', '/api/auth/register', {
        body: {
          name: uniqueName('doctor'),
          email: uniqueEmail('doctor'),
          password,
          role: 'doctor',
          phone: '0900000003',
        },
      });
      assertStatus(response, [201], 'POST /api/auth/register doctor');
      track('User', response.data.user.id);
      state.doctorToken = response.data.token;
      state.doctorUserId = response.data.user.id;
    });

    await runStep('POST /api/auth/register staff user', async () => {
      const response = await request(baseUrl, 'POST', '/api/auth/register', {
        body: {
          name: uniqueName('staff-user'),
          email: uniqueEmail('staff-user'),
          password,
          role: 'staff',
          phone: '0900000004',
        },
      });
      assertStatus(response, [201], 'POST /api/auth/register staff user');
      track('User', response.data.user.id);
      state.staffUserId = response.data.user.id;
    });

    state.patientProfile = await runStep('GET /api/patients/me', async () => {
      const response = await request(baseUrl, 'GET', '/api/patients/me', { token: state.patientToken });
      assertStatus(response, [200], 'GET /api/patients/me');
      track('Patient', response.data._id);
      return response.data;
    });

    state.doctorProfile = await runStep('GET /api/doctors/me', async () => {
      const response = await request(baseUrl, 'GET', '/api/doctors/me', { token: state.doctorToken });
      assertStatus(response, [200], 'GET /api/doctors/me');
      track('Doctor', response.data._id);
      return response.data;
    });

    await runStep('GET /api/users', async () => {
      const response = await request(baseUrl, 'GET', '/api/users', { token: state.adminToken });
      assertStatus(response, [200], 'GET /api/users');
      expect(Array.isArray(response.data), 'Users list is not an array');
    });

    const auxDoctorUser = await createDbUser(uniqueName('doctor-ref'), 'staff');
    const auxPatientUser = await createDbUser(uniqueName('patient-ref'), 'staff');
    const auxStaffUser = await createDbUser(uniqueName('staff-ref'), 'staff');

    const seededRole = await Role.create({ name: uniqueName('role-seed'), permissions: ['read'] });
    track('Role', seededRole._id);

    const seededSpecialty = await Specialty.create({ name: uniqueName('specialty-seed'), description: 'seed' });
    track('Specialty', seededSpecialty._id);

    const seededHospital = await Hospital.create({ name: uniqueName('hospital-seed'), description: 'seed hospital' });
    track('Hospital', seededHospital._id);

    const seededDepartment = await Department.create({
      name: uniqueName('department-seed'),
      hospital: seededHospital._id,
      description: 'seed department',
    });
    track('Department', seededDepartment._id);

    const seededAddress = await Address.create({
      street: '1 Seed Street',
      city: 'HCM',
      district: '1',
      ward: 'Ben Nghe',
      country: 'VN',
    });
    track('Address', seededAddress._id);

    const seededMedicine = await Medicine.create({ name: uniqueName('medicine-seed'), unit: 'vien', price: 5000, stock: 10 });
    track('Medicine', seededMedicine._id);

    const seededTest = await TestModel.create({ name: uniqueName('test-seed'), cost: 100000 });
    track('Test', seededTest._id);

    const seededDoctor = await Doctor.create({
      user: auxDoctorUser._id,
      specialties: [seededSpecialty._id],
      hospital: seededHospital._id,
      department: seededDepartment._id,
      qualifications: 'MD',
      experienceYears: 3,
    });
    track('Doctor', seededDoctor._id);

    const seededPatient = await Patient.create({
      user: auxPatientUser._id,
      gender: 'female',
      bloodType: 'A',
    });
    track('Patient', seededPatient._id);

    const seededStaff = await Staff.create({
      user: auxStaffUser._id,
      hospital: seededHospital._id,
      department: seededDepartment._id,
      title: 'Coordinator',
    });
    track('Staff', seededStaff._id);

    const seededInsurance = await Insurance.create({
      patient: state.patientProfile._id,
      provider: uniqueName('insurance-seed'),
      coveragePercent: 80,
    });
    track('Insurance', seededInsurance._id);

    const seededRoom = await Room.create({
      code: uniqueName('room-seed'),
      department: seededDepartment._id,
      capacity: 1,
    });
    track('Room', seededRoom._id);

    const seededSchedule = await Schedule.create({
      doctor: state.doctorProfile._id,
      room: seededRoom._id,
      department: seededDepartment._id,
      hospital: seededHospital._id,
      date: new Date('2026-05-01T00:00:00.000Z'),
      slot: 'morning',
      capacity: 2,
      status: 'open',
    });
    track('Schedule', seededSchedule._id);

    const seededAppointment = await Appointment.create({
      patient: state.patientProfile._id,
      doctor: state.doctorProfile._id,
      schedule: seededSchedule._id,
      room: seededRoom._id,
      date: new Date('2026-05-01T00:00:00.000Z'),
      time: '09:00',
      status: 'pending',
    });
    track('Appointment', seededAppointment._id);

    const seededMedicalRecord = await MedicalRecord.create({
      patient: state.patientProfile._id,
      appointment: seededAppointment._id,
      doctor: state.doctorProfile._id,
      diagnosis: 'seed diagnosis',
    });
    track('MedicalRecord', seededMedicalRecord._id);

    const seededTestResult = await TestResult.create({
      test: seededTest._id,
      medicalRecord: seededMedicalRecord._id,
      patient: state.patientProfile._id,
      doctor: state.doctorProfile._id,
      result: 'normal',
    });
    track('TestResult', seededTestResult._id);

    const seededPrescription = await Prescription.create({
      medicalRecord: seededMedicalRecord._id,
      doctor: state.doctorProfile._id,
      patient: state.patientProfile._id,
      items: [{ medicine: seededMedicine._id, dosage: '1 vien', quantity: 5 }],
      status: 'active',
    });
    track('Prescription', seededPrescription._id);

    const seededInvoice = await Invoice.create({
      appointment: seededAppointment._id,
      patient: state.patientProfile._id,
      doctor: state.doctorProfile._id,
      items: [{ title: 'seed consultation', amount: 200000 }],
      subTotal: 200000,
      total: 200000,
      status: 'unpaid',
    });
    track('Invoice', seededInvoice._id);

    const seededPayment = await Payment.create({
      invoice: seededInvoice._id,
      appointment: seededAppointment._id,
      patient: state.patientProfile._id,
      amount: 50000,
      status: 'pending',
    });
    track('Payment', seededPayment._id);

    const seededReview = await Review.create({
      patient: state.patientProfile._id,
      doctor: state.doctorProfile._id,
      hospital: seededHospital._id,
      appointment: seededAppointment._id,
      rating: 4,
      comment: 'seed review',
    });
    track('Review', seededReview._id);

    const seededRating = await Rating.create({
      patient: state.patientProfile._id,
      doctor: state.doctorProfile._id,
      hospital: seededHospital._id,
      appointment: seededAppointment._id,
      score: 4,
      comment: 'seed rating',
    });
    track('Rating', seededRating._id);

    const seededNotification = await Notification.create({
      user: state.patientUserId,
      title: 'seed notification',
      message: 'hello',
      type: 'info',
    });
    track('Notification', seededNotification._id);

    const seededFile = await FileUpload.create({
      owner: state.patientUserId,
      filename: 'seed.pdf',
      url: 'https://example.com/seed.pdf',
      type: 'lab',
    });
    track('FileUpload', seededFile._id);

    const created = {};

    await runStep('Roles CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/roles', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/roles');

      const getSeed = await request(baseUrl, 'GET', `/api/roles/${seededRole._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/roles/:id');

      const create = await request(baseUrl, 'POST', '/api/roles', {
        token: state.adminToken,
        body: { name: uniqueName('role-created'), permissions: ['read:all'] },
      });
      assertStatus(create, [201], 'POST /api/roles');
      track('Role', create.data._id);
      created.roleId = create.data._id;

      const update = await request(baseUrl, 'PUT', `/api/roles/${seededRole._id}`, {
        token: state.adminToken,
        body: { permissions: ['read', 'write'] },
      });
      assertStatus(update, [200], 'PUT /api/roles/:id');

      const del = await request(baseUrl, 'DELETE', `/api/roles/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/roles/:id');
    });

    await runStep('Specialties CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/specialties', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/specialties');
      const getSeed = await request(baseUrl, 'GET', `/api/specialties/${seededSpecialty._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/specialties/:id');
      const create = await request(baseUrl, 'POST', '/api/specialties', {
        token: state.adminToken,
        body: { name: uniqueName('specialty-created'), description: 'created' },
      });
      assertStatus(create, [201], 'POST /api/specialties');
      track('Specialty', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/specialties/${seededSpecialty._id}`, {
        token: state.adminToken,
        body: { description: 'updated' },
      });
      assertStatus(update, [200], 'PUT /api/specialties/:id');
      const del = await request(baseUrl, 'DELETE', `/api/specialties/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/specialties/:id');
    });

    await runStep('Hospitals CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/hospitals', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/hospitals');
      const getSeed = await request(baseUrl, 'GET', `/api/hospitals/${seededHospital._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/hospitals/:id');
      const create = await request(baseUrl, 'POST', '/api/hospitals', {
        token: state.adminToken,
        body: { name: uniqueName('hospital-created'), description: 'created hospital' },
      });
      assertStatus(create, [201], 'POST /api/hospitals');
      track('Hospital', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/hospitals/${seededHospital._id}`, {
        token: state.adminToken,
        body: { description: 'updated hospital' },
      });
      assertStatus(update, [200], 'PUT /api/hospitals/:id');
      const del = await request(baseUrl, 'DELETE', `/api/hospitals/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/hospitals/:id');
    });

    await runStep('Departments CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/departments', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/departments');
      const getSeed = await request(baseUrl, 'GET', `/api/departments/${seededDepartment._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/departments/:id');
      const create = await request(baseUrl, 'POST', '/api/departments', {
        token: state.adminToken,
        body: { name: uniqueName('department-created'), hospital: seededHospital._id, description: 'created department' },
      });
      assertStatus(create, [201], 'POST /api/departments');
      track('Department', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/departments/${seededDepartment._id}`, {
        token: state.adminToken,
        body: { description: 'updated department' },
      });
      assertStatus(update, [200], 'PUT /api/departments/:id');
      const del = await request(baseUrl, 'DELETE', `/api/departments/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/departments/:id');
    });

    await runStep('Doctors CRUD and profile', async () => {
      const me = await request(baseUrl, 'GET', '/api/doctors/me', { token: state.doctorToken });
      assertStatus(me, [200], 'GET /api/doctors/me');
      const list = await request(baseUrl, 'GET', '/api/doctors', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/doctors');
      const getSeed = await request(baseUrl, 'GET', `/api/doctors/${seededDoctor._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/doctors/:id');
      const create = await request(baseUrl, 'POST', '/api/doctors', {
        token: state.adminToken,
        body: {
          user: auxDoctorUser._id,
          specialties: [seededSpecialty._id],
          hospital: seededHospital._id,
          department: seededDepartment._id,
          qualifications: 'BS CKI',
          experienceYears: 5,
        },
      });
      assertStatus(create, [201], 'POST /api/doctors');
      track('Doctor', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/doctors/${seededDoctor._id}`, {
        token: state.adminToken,
        body: { bio: 'updated bio' },
      });
      assertStatus(update, [200], 'PUT /api/doctors/:id');
      const del = await request(baseUrl, 'DELETE', `/api/doctors/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/doctors/:id');
    });

    await runStep('Patients CRUD and profile', async () => {
      const me = await request(baseUrl, 'GET', '/api/patients/me', { token: state.patientToken });
      assertStatus(me, [200], 'GET /api/patients/me');
      const list = await request(baseUrl, 'GET', '/api/patients', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/patients');
      const getSeed = await request(baseUrl, 'GET', `/api/patients/${seededPatient._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/patients/:id');
      const create = await request(baseUrl, 'POST', '/api/patients', {
        token: state.adminToken,
        body: { user: auxPatientUser._id, gender: 'male', bloodType: 'O' },
      });
      assertStatus(create, [201], 'POST /api/patients');
      track('Patient', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/patients/${seededPatient._id}`, {
        token: state.adminToken,
        body: { allergies: ['dust'] },
      });
      assertStatus(update, [200], 'PUT /api/patients/:id');
      const del = await request(baseUrl, 'DELETE', `/api/patients/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/patients/:id');
    });

    await runStep('Staff CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/staff', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/staff');
      const getSeed = await request(baseUrl, 'GET', `/api/staff/${seededStaff._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/staff/:id');
      const create = await request(baseUrl, 'POST', '/api/staff', {
        token: state.adminToken,
        body: { user: state.staffUserId, hospital: seededHospital._id, department: seededDepartment._id, title: 'Reception' },
      });
      assertStatus(create, [201], 'POST /api/staff');
      track('Staff', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/staff/${seededStaff._id}`, {
        token: state.adminToken,
        body: { status: 'inactive' },
      });
      assertStatus(update, [200], 'PUT /api/staff/:id');
      const del = await request(baseUrl, 'DELETE', `/api/staff/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/staff/:id');
    });

    await runStep('Addresses CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/addresses', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/addresses');
      const getSeed = await request(baseUrl, 'GET', `/api/addresses/${seededAddress._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/addresses/:id');
      const create = await request(baseUrl, 'POST', '/api/addresses', {
        token: state.adminToken,
        body: { street: '10 Nguyen Hue', city: 'HCM', district: '1', country: 'VN' },
      });
      assertStatus(create, [201], 'POST /api/addresses');
      track('Address', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/addresses/${seededAddress._id}`, {
        token: state.adminToken,
        body: { ward: 'updated ward' },
      });
      assertStatus(update, [200], 'PUT /api/addresses/:id');
      const del = await request(baseUrl, 'DELETE', `/api/addresses/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/addresses/:id');
    });

    await runStep('Medicines CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/medicines', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/medicines');
      const getSeed = await request(baseUrl, 'GET', `/api/medicines/${seededMedicine._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/medicines/:id');
      const create = await request(baseUrl, 'POST', '/api/medicines', {
        token: state.adminToken,
        body: { name: uniqueName('medicine-created'), unit: 'vien', price: 12000, stock: 50 },
      });
      assertStatus(create, [201], 'POST /api/medicines');
      track('Medicine', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/medicines/${seededMedicine._id}`, {
        token: state.adminToken,
        body: { stock: 99 },
      });
      assertStatus(update, [200], 'PUT /api/medicines/:id');
      const del = await request(baseUrl, 'DELETE', `/api/medicines/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/medicines/:id');
    });

    await runStep('Insurances CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/insurances', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/insurances');
      const getSeed = await request(baseUrl, 'GET', `/api/insurances/${seededInsurance._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/insurances/:id');
      const create = await request(baseUrl, 'POST', '/api/insurances', {
        token: state.adminToken,
        body: { patient: state.patientProfile._id, provider: uniqueName('insurance-created'), coveragePercent: 90 },
      });
      assertStatus(create, [201], 'POST /api/insurances');
      track('Insurance', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/insurances/${seededInsurance._id}`, {
        token: state.adminToken,
        body: { coveragePercent: 70 },
      });
      assertStatus(update, [200], 'PUT /api/insurances/:id');
      const del = await request(baseUrl, 'DELETE', `/api/insurances/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/insurances/:id');
    });

    await runStep('Schedules CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/schedules', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/schedules');
      const getSeed = await request(baseUrl, 'GET', `/api/schedules/${seededSchedule._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/schedules/:id');
      const create = await request(baseUrl, 'POST', '/api/schedules', {
        token: state.adminToken,
        body: {
          doctor: state.doctorProfile._id,
          room: seededRoom._id,
          department: seededDepartment._id,
          hospital: seededHospital._id,
          date: '2026-05-02T00:00:00.000Z',
          slot: 'afternoon',
          capacity: 3,
          status: 'open',
        },
      });
      assertStatus(create, [201], 'POST /api/schedules');
      track('Schedule', create.data._id);
      created.scheduleId = create.data._id;
      const update = await request(baseUrl, 'PUT', `/api/schedules/${seededSchedule._id}`, {
        token: state.adminToken,
        body: { capacity: 4 },
      });
      assertStatus(update, [200], 'PUT /api/schedules/:id');
      const del = await request(baseUrl, 'DELETE', `/api/schedules/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/schedules/:id');
    });

    await runStep('Appointments flow', async () => {
      const list = await request(baseUrl, 'GET', '/api/appointments', { token: state.patientToken });
      assertStatus(list, [200], 'GET /api/appointments');
      const getSeed = await request(baseUrl, 'GET', `/api/appointments/${seededAppointment._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/appointments/:id');
      const create = await request(baseUrl, 'POST', '/api/appointments', {
        token: state.patientToken,
        body: {
          doctor: state.doctorProfile._id,
          schedule: seededSchedule._id,
          room: seededRoom._id,
          date: '2026-05-03T00:00:00.000Z',
          time: '10:00',
          notes: 'smoke appointment',
        },
      });
      assertStatus(create, [201], 'POST /api/appointments');
      track('Appointment', create.data._id);
      created.appointmentId = create.data._id;
      const update = await request(baseUrl, 'PUT', `/api/appointments/${seededAppointment._id}`, {
        token: state.adminToken,
        body: { status: 'confirmed' },
      });
      assertStatus(update, [200], 'PUT /api/appointments/:id');
      const cancel = await request(baseUrl, 'POST', `/api/appointments/${create.data._id}/cancel`, {
        token: state.patientToken,
        body: { cancelReason: 'smoke cancel' },
      });
      assertStatus(cancel, [200], 'POST /api/appointments/:id/cancel');
    });

    await runStep('Medical records CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/medical-records', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/medical-records');
      const getSeed = await request(baseUrl, 'GET', `/api/medical-records/${seededMedicalRecord._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/medical-records/:id');
      const create = await request(baseUrl, 'POST', '/api/medical-records', {
        token: state.doctorToken,
        body: {
          patient: state.patientProfile._id,
          appointment: seededAppointment._id,
          doctor: state.doctorProfile._id,
          diagnosis: 'flu',
          symptoms: ['fever'],
        },
      });
      assertStatus(create, [201], 'POST /api/medical-records');
      track('MedicalRecord', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/medical-records/${seededMedicalRecord._id}`, {
        token: state.doctorToken,
        body: { notes: 'updated notes' },
      });
      assertStatus(update, [200], 'PUT /api/medical-records/:id');
      const del = await request(baseUrl, 'DELETE', `/api/medical-records/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/medical-records/:id');
    });

    await runStep('Tests CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/tests', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/tests');
      const getSeed = await request(baseUrl, 'GET', `/api/tests/${seededTest._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/tests/:id');
      const create = await request(baseUrl, 'POST', '/api/tests', {
        token: state.adminToken,
        body: { name: uniqueName('test-created'), cost: 300000 },
      });
      assertStatus(create, [201], 'POST /api/tests');
      track('Test', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/tests/${seededTest._id}`, {
        token: state.adminToken,
        body: { cost: 123456 },
      });
      assertStatus(update, [200], 'PUT /api/tests/:id');
      const del = await request(baseUrl, 'DELETE', `/api/tests/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/tests/:id');
    });

    await runStep('Test results CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/test-results', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/test-results');
      const getSeed = await request(baseUrl, 'GET', `/api/test-results/${seededTestResult._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/test-results/:id');
      const create = await request(baseUrl, 'POST', '/api/test-results', {
        token: state.doctorToken,
        body: {
          test: seededTest._id,
          medicalRecord: seededMedicalRecord._id,
          patient: state.patientProfile._id,
          doctor: state.doctorProfile._id,
          result: 'normal',
          fileUrl: 'https://example.com/result.pdf',
        },
      });
      assertStatus(create, [201], 'POST /api/test-results');
      track('TestResult', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/test-results/${seededTestResult._id}`, {
        token: state.doctorToken,
        body: { result: 'updated' },
      });
      assertStatus(update, [200], 'PUT /api/test-results/:id');
      const del = await request(baseUrl, 'DELETE', `/api/test-results/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/test-results/:id');
    });

    await runStep('Prescriptions CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/prescriptions', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/prescriptions');
      const getSeed = await request(baseUrl, 'GET', `/api/prescriptions/${seededPrescription._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/prescriptions/:id');
      const create = await request(baseUrl, 'POST', '/api/prescriptions', {
        token: state.doctorToken,
        body: {
          medicalRecord: seededMedicalRecord._id,
          doctor: state.doctorProfile._id,
          patient: state.patientProfile._id,
          items: [{ medicine: seededMedicine._id, dosage: '2 vien', quantity: 10, instructions: 'after meal' }],
          note: 'created prescription',
        },
      });
      assertStatus(create, [201], 'POST /api/prescriptions');
      track('Prescription', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/prescriptions/${seededPrescription._id}`, {
        token: state.doctorToken,
        body: { status: 'fulfilled' },
      });
      assertStatus(update, [200], 'PUT /api/prescriptions/:id');
      const del = await request(baseUrl, 'DELETE', `/api/prescriptions/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/prescriptions/:id');
    });

    await runStep('Invoices CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/invoices', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/invoices');
      const getSeed = await request(baseUrl, 'GET', `/api/invoices/${seededInvoice._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/invoices/:id');
      const create = await request(baseUrl, 'POST', '/api/invoices', {
        token: state.adminToken,
        body: {
          appointment: seededAppointment._id,
          patient: state.patientProfile._id,
          doctor: state.doctorProfile._id,
          items: [{ title: 'consultation', amount: 150000 }],
          subTotal: 150000,
          tax: 15000,
          total: 165000,
        },
      });
      assertStatus(create, [201], 'POST /api/invoices');
      track('Invoice', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/invoices/${seededInvoice._id}`, {
        token: state.adminToken,
        body: { discount: 10000 },
      });
      assertStatus(update, [200], 'PUT /api/invoices/:id');
      const del = await request(baseUrl, 'DELETE', `/api/invoices/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/invoices/:id');
    });

    await runStep('Payments CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/payments', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/payments');
      const getSeed = await request(baseUrl, 'GET', `/api/payments/${seededPayment._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/payments/:id');
      const create = await request(baseUrl, 'POST', '/api/payments', {
        token: state.adminToken,
        body: {
          invoice: seededInvoice._id,
          appointment: seededAppointment._id,
          patient: state.patientProfile._id,
          amount: 200000,
          status: 'completed',
        },
      });
      assertStatus(create, [201], 'POST /api/payments');
      track('Payment', create.data._id);
      const update = await request(baseUrl, 'PUT', `/api/payments/${seededPayment._id}`, {
        token: state.adminToken,
        body: { status: 'completed' },
      });
      assertStatus(update, [200], 'PUT /api/payments/:id');
      const del = await request(baseUrl, 'DELETE', `/api/payments/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/payments/:id');
    });

    await runStep('Reviews CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/reviews', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/reviews');
      const getSeed = await request(baseUrl, 'GET', `/api/reviews/${seededReview._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/reviews/:id');
      const create = await request(baseUrl, 'POST', '/api/reviews', {
        token: state.patientToken,
        body: {
          doctor: state.doctorProfile._id,
          hospital: seededHospital._id,
          appointment: seededAppointment._id,
          rating: 5,
          comment: 'patient review',
        },
      });
      assertStatus(create, [201], 'POST /api/reviews');
      track('Review', create.data._id);
      const createdGet = await request(baseUrl, 'GET', `/api/reviews/${create.data._id}`, { token: state.adminToken });
      assertStatus(createdGet, [200], 'GET created review');
      expect(createdGet.data.patient, 'Created review lost populated patient reference');
      const update = await request(baseUrl, 'PUT', `/api/reviews/${seededReview._id}`, {
        token: state.adminToken,
        body: { status: 'approved' },
      });
      assertStatus(update, [200], 'PUT /api/reviews/:id');
      const del = await request(baseUrl, 'DELETE', `/api/reviews/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/reviews/:id');
    });

    await runStep('Ratings CRUD', async () => {
      const list = await request(baseUrl, 'GET', '/api/ratings', { token: state.adminToken });
      assertStatus(list, [200], 'GET /api/ratings');
      const getSeed = await request(baseUrl, 'GET', `/api/ratings/${seededRating._id}`, { token: state.adminToken });
      assertStatus(getSeed, [200], 'GET /api/ratings/:id');
      const create = await request(baseUrl, 'POST', '/api/ratings', {
        token: state.patientToken,
        body: {
          doctor: state.doctorProfile._id,
          hospital: seededHospital._id,
          appointment: seededAppointment._id,
          score: 5,
          comment: 'patient rating',
        },
      });
      assertStatus(create, [201], 'POST /api/ratings');
      track('Rating', create.data._id);
      const createdGet = await request(baseUrl, 'GET', `/api/ratings/${create.data._id}`, { token: state.adminToken });
      assertStatus(createdGet, [200], 'GET created rating');
      expect(createdGet.data.patient, 'Created rating lost populated patient reference');
      const update = await request(baseUrl, 'PUT', `/api/ratings/${seededRating._id}`, {
        token: state.adminToken,
        body: { score: 3 },
      });
      assertStatus(update, [200], 'PUT /api/ratings/:id');
      const del = await request(baseUrl, 'DELETE', `/api/ratings/${create.data._id}`, { token: state.adminToken });
      assertStatus(del, [200], 'DELETE /api/ratings/:id');
    });

    await runStep('Notifications flow', async () => {
      const list = await request(baseUrl, 'GET', '/api/notifications', { token: state.patientToken });
      assertStatus(list, [200], 'GET /api/notifications');
      const create = await request(baseUrl, 'POST', '/api/notifications', {
        token: state.adminToken,
        body: {
          user: state.patientUserId,
          title: 'created notification',
          message: 'hello patient',
          type: 'info',
        },
      });
      assertStatus(create, [201], 'POST /api/notifications');
      track('Notification', create.data._id);
      const read = await request(baseUrl, 'POST', `/api/notifications/${create.data._id}/read`, { token: state.patientToken });
      assertStatus(read, [200], 'POST /api/notifications/:id/read');
      expect(read.data.readAt, 'Notification readAt not set');
      const del = await request(baseUrl, 'DELETE', `/api/notifications/${create.data._id}`, { token: state.patientToken });
      assertStatus(del, [200], 'DELETE /api/notifications/:id');
    });

    await runStep('Files flow', async () => {
      const list = await request(baseUrl, 'GET', '/api/files', { token: state.patientToken });
      assertStatus(list, [200], 'GET /api/files');
      const getSeed = await request(baseUrl, 'GET', `/api/files/${seededFile._id}`, { token: state.patientToken });
      assertStatus(getSeed, [200], 'GET /api/files/:id');
      const create = await request(baseUrl, 'POST', '/api/files', {
        token: state.patientToken,
        body: {
          type: 'lab',
          filename: 'result.pdf',
          url: 'https://example.com/result.pdf',
        },
      });
      assertStatus(create, [201], 'POST /api/files');
      track('FileUpload', create.data._id);
      const del = await request(baseUrl, 'DELETE', `/api/files/${create.data._id}`, { token: state.patientToken });
      assertStatus(del, [200], 'DELETE /api/files/:id');
    });

    const passed = results.filter((item) => item.ok).length;
    const failed = results.filter((item) => !item.ok);

    console.log(`\nSmoke test completed: ${passed}/${results.length} steps passed.`);
    for (const item of results) {
      console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.ok ? '' : ` -> ${item.error}`}`);
    }

    if (failed.length) {
      process.exitCode = 1;
    }
  } finally {
    await cleanup().catch((error) => {
      console.error('Cleanup failed:', error.message);
      process.exitCode = 1;
    });

    if (server) {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }

    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});