/**
 * OpenAPI 3.0 — MediReserve (tóm tắt endpoint; chi tiết body xem controllers / linkTest.md)
 */
const bearer = [{ bearerAuth: [] }];

const op = (summary, tag, opts = {}) => ({
  tags: [tag],
  summary,
  ...(opts.public ? {} : { security: bearer }),
  responses: opts.responses || {
    200: { description: 'Thành công' },
  },
});

const op201 = (summary, tag) => ({
  tags: [tag],
  summary,
  security: bearer,
  responses: {
    201: { description: 'Đã tạo' },
    400: { description: 'Dữ liệu không hợp lệ' },
  },
});

const crudId = (tag, name) => ({
  get: op(`Chi tiết ${name}`, tag),
  put: op(`Cập nhật ${name}`, tag),
  delete: op(`Xóa ${name}`, tag),
});

const paths = {
  '/': {
    get: op('Kiểm tra API đang chạy', 'Health', { public: true }),
  },
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng ký tài khoản',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterBody' },
          },
        },
      },
      responses: {
        201: { description: 'Đã tạo, trả token' },
        400: { description: 'Email đã tồn tại / validation' },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng nhập',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginBody' },
          },
        },
      },
      responses: {
        200: { description: 'Trả token' },
        401: { description: 'Sai email hoặc mật khẩu' },
      },
    },
  },
  '/api/auth/profile': {
    get: op('Hồ sơ user hiện tại (JWT)', 'Auth'),
  },
  '/api/users': {
    get: op('Danh sách User (admin); ?role= tùy chọn', 'Users'),
  },
  '/api/roles': {
    get: op('Danh sách role (admin)', 'Roles'),
    post: op201('Tạo role (admin)', 'Roles'),
  },
  '/api/roles/{id}': {
    ...crudId('Roles', 'role'),
  },
  '/api/specialties': {
    get: op('Danh sách chuyên khoa', 'Specialties'),
    post: op201('Tạo chuyên khoa (admin)', 'Specialties'),
  },
  '/api/specialties/{id}': {
    ...crudId('Specialties', 'chuyên khoa'),
  },
  '/api/hospitals': {
    get: op('Danh sách bệnh viện', 'Hospitals'),
    post: op201('Tạo bệnh viện (admin)', 'Hospitals'),
  },
  '/api/hospitals/{id}': {
    ...crudId('Hospitals', 'bệnh viện'),
  },
  '/api/departments': {
    get: op('Danh sách khoa', 'Departments'),
    post: op201('Tạo khoa (admin)', 'Departments'),
  },
  '/api/departments/{id}': {
    ...crudId('Departments', 'khoa'),
  },
  '/api/doctors': {
    get: op('Danh sách bác sĩ', 'Doctors'),
    post: op201('Tạo hồ sơ bác sĩ (admin, staff)', 'Doctors'),
  },
  '/api/doctors/me': {
    get: op('Hồ sơ bác sĩ của tôi', 'Doctors'),
  },
  '/api/doctors/{id}': {
    ...crudId('Doctors', 'bác sĩ'),
  },
  '/api/patients': {
    get: op('Danh sách bệnh nhân (admin, staff, doctor)', 'Patients'),
    post: op201('Tạo bệnh nhân (admin, staff)', 'Patients'),
  },
  '/api/patients/me': {
    get: op('Hồ sơ bệnh nhân của tôi', 'Patients'),
  },
  '/api/patients/{id}': {
    ...crudId('Patients', 'bệnh nhân'),
  },
  '/api/schedules': {
    get: op('Danh sách lịch (?doctor, ?hospital, ?department, ?date)', 'Schedules'),
    post: op201('Tạo lịch (admin, doctor, staff)', 'Schedules'),
  },
  '/api/schedules/{id}': {
    ...crudId('Schedules', 'lịch'),
  },
  '/api/appointments': {
    get: op('Danh sách lịch hẹn (?status=)', 'Appointments'),
    post: op201('Đặt lịch (patient, admin, staff)', 'Appointments'),
  },
  '/api/appointments/{id}': {
    get: op('Chi tiết lịch hẹn', 'Appointments'),
    put: op('Cập nhật lịch (admin, staff, doctor)', 'Appointments'),
  },
  '/api/appointments/{id}/cancel': {
    post: op('Hủy lịch hẹn', 'Appointments'),
  },
  '/api/medical-records': {
    get: op('Danh sách hồ sơ y tế', 'Medical records'),
    post: op201('Tạo hồ sơ (doctor, admin, staff)', 'Medical records'),
  },
  '/api/medical-records/{id}': {
    ...crudId('Medical records', 'hồ sơ y tế'),
  },
  '/api/prescriptions': {
    get: op('Danh sách đơn thuốc', 'Prescriptions'),
    post: op201('Tạo đơn thuốc (doctor, admin, staff)', 'Prescriptions'),
  },
  '/api/prescriptions/{id}': {
    ...crudId('Prescriptions', 'đơn thuốc'),
  },
  '/api/reviews': {
    get: op('Danh sách đánh giá', 'Reviews'),
    post: op201('Tạo đánh giá (patient, admin, staff)', 'Reviews'),
  },
  '/api/reviews/{id}': {
    ...crudId('Reviews', 'đánh giá'),
  },
  '/api/ratings': {
    get: op('Danh sách xếp hạng', 'Ratings'),
    post: op201('Tạo rating (patient, admin, staff)', 'Ratings'),
  },
  '/api/ratings/{id}': {
    ...crudId('Ratings', 'rating'),
  },
  '/api/tests': {
    get: op('Danh sách xét nghiệm (catalog)', 'Tests'),
    post: op201('Tạo xét nghiệm (admin, staff)', 'Tests'),
  },
  '/api/tests/{id}': {
    ...crudId('Tests', 'xét nghiệm'),
  },
  '/api/test-results': {
    get: op('Danh sách kết quả xét nghiệm', 'Test results'),
    post: op201('Tạo kết quả (doctor, admin, staff)', 'Test results'),
  },
  '/api/test-results/{id}': {
    ...crudId('Test results', 'kết quả'),
  },
  '/api/notifications': {
    get: op('Danh sách thông báo', 'Notifications'),
    post: op201('Tạo thông báo (admin, staff)', 'Notifications'),
  },
  '/api/notifications/{id}/read': {
    post: op('Đánh dấu đã đọc', 'Notifications'),
  },
  '/api/notifications/{id}': {
    delete: op('Xóa thông báo', 'Notifications'),
  },
  '/api/files': {
    get: op('Danh sách file của tôi', 'Files'),
    post: op201('Ghi nhận file (metadata)', 'Files'),
  },
  '/api/files/{id}': {
    get: op('Chi tiết file', 'Files'),
    delete: op('Xóa file', 'Files'),
  },
  '/api/staff': {
    get: op('Danh sách nhân viên (admin)', 'Staff'),
    post: op201('Tạo nhân viên (admin)', 'Staff'),
  },
  '/api/staff/{id}': {
    ...crudId('Staff', 'nhân viên'),
  },
  '/api/addresses': {
    get: op('Danh sách địa chỉ', 'Addresses'),
    post: op201('Tạo địa chỉ (admin, staff)', 'Addresses'),
  },
  '/api/addresses/{id}': {
    ...crudId('Addresses', 'địa chỉ'),
  },
  '/api/medicines': {
    get: op('Danh sách thuốc', 'Medicines'),
    post: op201('Tạo thuốc (admin, staff)', 'Medicines'),
  },
  '/api/medicines/{id}': {
    ...crudId('Medicines', 'thuốc'),
  },
  '/api/insurances': {
    get: op('Danh sách bảo hiểm', 'Insurances'),
    post: op201('Tạo bảo hiểm (admin, staff)', 'Insurances'),
  },
  '/api/insurances/{id}': {
    ...crudId('Insurances', 'bảo hiểm'),
  },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'MediReserve API',
    version: '1.0.0',
    description:
      'Hệ thống đặt lịch khám bệnh viện. Hầu hết route cần header `Authorization: Bearer <JWT>`.',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local (mặc định PORT=4000)' },
  ],
  tags: [
    { name: 'Health', description: 'Kiểm tra server' },
    { name: 'Auth', description: 'Đăng ký / đăng nhập / profile' },
    { name: 'Users', description: 'Danh sách tài khoản (admin)' },
    { name: 'Roles', description: 'Vai trò hệ thống (admin)' },
    { name: 'Hospitals', description: 'Bệnh viện' },
    { name: 'Departments', description: 'Khoa' },
    { name: 'Doctors', description: 'Bác sĩ' },
    { name: 'Patients', description: 'Bệnh nhân' },
    { name: 'Specialties', description: 'Chuyên khoa' },
    { name: 'Schedules', description: 'Lịch làm việc' },
    { name: 'Appointments', description: 'Lịch hẹn' },
    { name: 'Medical records', description: 'Hồ sơ y tế' },
    { name: 'Prescriptions', description: 'Đơn thuốc' },
    { name: 'Reviews', description: 'Đánh giá' },
    { name: 'Ratings', description: 'Xếp hạng' },
    { name: 'Tests', description: 'Danh mục xét nghiệm' },
    { name: 'Test results', description: 'Kết quả xét nghiệm' },
    { name: 'Notifications', description: 'Thông báo' },
    { name: 'Files', description: 'Metadata file đính kèm' },
    { name: 'Staff', description: 'Nhân viên' },
    { name: 'Addresses', description: 'Địa chỉ' },
    { name: 'Medicines', description: 'Thuốc' },
    { name: 'Insurances', description: 'Bảo hiểm' },
  ],
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT từ POST /api/auth/login hoặc /api/auth/register',
      },
    },
    schemas: {
      RegisterBody: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['patient', 'doctor', 'admin', 'staff'] },
          phone: { type: 'string' },
          address: { type: 'object' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};
