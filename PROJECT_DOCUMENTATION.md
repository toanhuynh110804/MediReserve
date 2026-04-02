# 📋 MediReserve - Hospital Booking System

## 📌 Mục Đích Dự Án

**MediReserve** là một hệ thống quản lý đặt lịch khám bệnh trực tuyến cho bệnh viện. Cho phép bệnh nhân đặt lịch khám, bác sĩ quản lý lịch làm việc, và bệnh viện quản lý toàn bộ dịch vụ y tế.

---

## 🏗️ Kiến Trúc Ứng Dụng

### Stack Công Nghệ
```
Framework:     Express.js (Node.js)
Database:      MongoDB (NoSQL)
Authentication: JWT + bcryptjs
Realtime:      Socket.IO
Upload:        Multer (local storage: /uploads)
Transaction:   Mongoose session/withTransaction
API Security:  CORS, Helmet
Logging:       Morgan
Environment:   dotenv
```

### Cấu Trúc Thư Mục
```
MediReserve/
├── src/
│   ├── app.js                    # Express setup
│   ├── server.js                 # Entry point
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/                   # 25+ MongoDB schemas
│   ├── controllers/              # 20+ business logic
│   ├── routes/                   # 20+ API endpoints
│   └── middlewares/
│       ├── auth.middleware.js    # JWT & Role authorization
│       ├── upload.middleware.js  # Multer file upload
│       └── error.middleware.js   # Error handling
├── package.json
├── .env.example
└── PROJECT_DOCUMENTATION.md (file này)
```

---

## 🎯 Các Tính Năng Chính Đã Hoàn Thành

### ✅ 1. Xác Thực & Phân Quyền (Authentication & Authorization)

**Files liên quan:**
- `src/controllers/auth.controller.js`
- `src/routes/auth.route.js`
- `src/middlewares/auth.middleware.js`
- `src/models/User.js`

**Chức năng:**
- ✅ Đăng ký người dùng (register)
- ✅ Đăng nhập với JWT token (login)
- ✅ Lấy thông tin hồ sơ người dùng (profile)
- ✅ Mã hóa mật khẩu với bcryptjs
- ✅ JWT token xác thực (1 ngày mặc định)
- ✅ Phân quyền theo vai trò (patient, doctor, admin, staff)
- ✅ Middleware xác thực cho các route bảo vệ

**Endpoints:**
```
POST   /api/auth/register          - Đăng ký tài khoản
POST   /api/auth/login              - Đăng nhập
GET    /api/auth/profile            - Lấy hồ sơ (yêu cầu token)
```

---

### ✅ 2. Quản Lý Người Dùng (User Management)

**Models:**
- `User.js` - Base model cho tất cả người dùng
- `Patient.js` - Mở rộng từ User
- `Doctor.js` - Mở rộng từ User
- `Staff.js` - Nhân viên bệnh viện
- `Role.js` - Quản lý vai trò

**Thông tin User:**
- Tên, email (unique), mật khẩu (hashed)
- Vai trò (patient, doctor, admin, staff)
- Số điện thoại, địa chỉ
- Avatar URL
- Timestamps (createdAt, updatedAt)

**Thông tin Patient (Bệnh Nhân):**
- Liên kết với User
- Ngày sinh, giới tính, nhóm máu
- Lịch sử bệnh (array)
- Dị ứng (array)
- Thông tin bảo hiểm

**Thông tin Doctor (Bác Sĩ):**
- Liên kết với User
- Chuyên khoa (array)
- Bệnh viện, khoa
- Bằng cấp, kinh nghiệm (năm)
- Tiểu sử (bio)
- Xếp hạng (rating, ratingCount)
- Trạng thái hoạt động (active/inactive)

---

### ✅ 3. Quản Lý Bệnh Viện (Hospital Management)

**Files liên quan:**
- `src/models/Hospital.js`
- `src/models/Department.js`
- `src/models/Room.js`
- `src/controllers/hospital.controller.js`
- `src/controllers/department.controller.js`

**Chức năng:**
- ✅ Tạo/cập nhật thông tin bệnh viện
- ✅ Quản lý tên, mô tả, địa chỉ
- ✅ Lưu trữ thông tin liên hệ (phone, email, website)
- ✅ Liên kết khoa với bệnh viện
- ✅ Quản lý phòng khám
- ✅ Gán bác sĩ vào bệnh viện/khoa

**Models:**
```javascript
Hospital:
  - name (unique)
  - description
  - address (street, city, state, zip, country)
  - phone, email, website
  - departments (array refs)

Department:
  - name
  - hospital (ref)
  - description

Room:
  - roomNumber
  - capacity
  - type (examination, surgery, etc.)
```

---

### ✅ 4. Hệ Thống Đặt Lịch (Schedule Management)

**Files liên quan:**
- `src/models/Schedule.js`
- `src/models/Shift.js`
- `src/controllers/schedule.controller.js`

**Chức năng:**
- ✅ Bác sĩ tạo lịch làm việc
- ✅ Định nghĩa slot thời gian (sáng, chiều, tối)
- ✅ Đặt sức chứa (capacity) cho mỗi slot
- ✅ Quản lý số lượng đặt chỗ (bookedCount)
- ✅ Tự động đóng slot khi đầy
- ✅ Trạng thái lịch (open, closed, cancelled)

**Model Schedule:**
```javascript
{
  doctor (ref),
  room (ref),
  department (ref),
  hospital (ref),
  date,
  slot (e.g., "morning", "afternoon", "evening"),
  capacity (default: 1),
  bookedCount (auto-increment),
  status: 'open' | 'closed' | 'cancelled'
}
```

---

### ✅ 5. Hệ Thống Đặt & Quản Lý Lịch Hẹn (Appointment System)

**Files liên quan:**
- `src/models/Appointment.js`
- `src/controllers/appointment.controller.js`
- `src/routes/appointment.route.js`

**Chức năng:**
- ✅ Bệnh nhân xem lịch trống
- ✅ Bệnh nhân đặt lịch hẹn từ schedule
- ✅ Tự động tăng bookedCount trên schedule
- ✅ Tự động đóng schedule khi đầy
- ✅ Theo dõi trạng thái appointment
- ✅ Lọc lịch hẹn theo bệnh nhân/bác sĩ/trạng thái
- ✅ Hủy lịch hẹn với lý do

**Appointment Status:**
- `pending` - Chờ phê duyệt
- `confirmed` - Đã xác nhận
- `completed` - Hoàn thành
- `cancelled` - Bị hủy
- `no-show` - Không xuất hiện

**Payment Status:**
- `unpaid` - Chưa thanh toán
- `paid` - Đã thanh toán
- `partial` - Thanh toán từng phần
- `refunded` - Hoàn tiền

**Endpoints:**
```
POST   /api/appointments           - Đặt lịch hẹn
GET    /api/appointments           - Xem danh sách (theo user role)
GET    /api/appointments/:id       - Xem chi tiết
PUT    /api/appointments/:id       - Cập nhật
POST   /api/appointments/:id/cancel - Hủy lịch
```

---

### ✅ 6. Dịch Vụ Y Tế (Medical Services)

#### 6.1 Hồ Sơ Y Tế (Medical Records)
**Files:** `src/models/MedicalRecord.js`, `src/controllers/medicalRecord.controller.js`

```javascript
MedicalRecord:
  - patient (ref)
  - appointment (ref)
  - doctor (ref)
  - diagnosis (string)
  - symptoms (array)
  - notes (string)
  - tests (array of TestResult refs)
  - prescriptions (array of Prescription refs)
  - timestamps
```

#### 6.2 Đơn Thuốc (Prescription)
**Files:** `src/models/Prescription.js`, `src/controllers/prescription.controller.js`

```javascript
Prescription:
  - medicalRecord (ref)
  - doctor (ref)
  - patient (ref)
  - items: [
      {
        medicine (ref),
        dosage (e.g., "2 viên x 3 lần"),
        quantity (số lượng),
        instructions (hướng dẫn sử dụng)
      }
    ]
  - note
  - status: 'active' | 'fulfilled' | 'cancelled'
```

#### 6.3 Xét Nghiệm (Tests & Results)
**Files:** `src/models/Test.js`, `src/models/TestResult.js`

```javascript
Test:
  - name
  - description
  - cost

TestResult:
  - test (ref)
  - patient (ref)
  - appointment (ref)
  - result (string/number)
  - result_unit
  - normal_range
  - status: 'pending' | 'completed' | 'abnormal'
```

#### 6.4 Thuốc (Medicine)
**Files:** `src/models/Medicine.js`, `src/controllers/medicine.controller.js`

```javascript
Medicine:
  - name
  - description
  - unit (e.g., "viên", "ml", "mg")
  - price
  - stock (tồn kho)
```

---

### ✅ 7. Thanh Toán & Hóa Đơn (Payment & Billing System)

#### 7.1 Hóa Đơn (Invoice)
**Files:** `src/models/Invoice.js`, `src/controllers/invoice.controller.js`

```javascript
Invoice:
  - appointment (ref, optional)
  - patient (ref)
  - doctor (ref)
  - items: [
      {
        title: "Không thăm khám",
        amount: 200000
      }
    ]
  - subTotal
  - tax (10%)
  - discount
  - total
  - status: 'unpaid' | 'paid' | 'partial' | 'refunded'
```

#### 7.2 Thanh Toán (Payment)
**Files:** `src/models/Payment.js`, `src/controllers/payment.controller.js`

```javascript
Payment:
  - invoice (ref)
  - appointment (ref)
  - patient (ref)
  - method: 'cash' | 'card' | 'insurance' | 'online'
  - amount
  - status: 'pending' | 'completed' | 'failed' | 'refunded'
  - transactionId (từ payment gateway)
```

**Endpoints:**
```
POST   /api/invoices               - Tạo hóa đơn
GET    /api/invoices               - Xem danh sách
GET    /api/invoices/:id           - Chi tiết
PUT    /api/invoices/:id           - Cập nhật

POST   /api/payments               - Thanh toán
GET    /api/payments               - Xem lịch sử thanh toán
GET    /api/payments/:id           - Chi tiết thanh toán
```

---

### ✅ 8. Đánh Giá & Xếp Hạng (Reviews & Ratings)

**Files liên quan:**
- `src/models/Review.js`
- `src/models/Rating.js`
- `src/controllers/review.controller.js`
- `src/controllers/rating.controller.js`

**Chức năng:**
- ✅ Bệnh nhân đánh giá bác sĩ/bệnh viện
- ✅ Xếp hạng từ 1-5 sao
- ✅ Phê duyệt review trước xuất bản
- ✅ Tự động cập nhật xếp hạng bác sĩ

```javascript
Review:
  - appointment (ref)
  - patient (ref)
  - doctor (ref)
  - hospital (ref)
  - rating (1-5)
  - comment
  - status: 'pending' | 'approved' | 'rejected'

Doctor (rating fields):
  - rating (float, avg)
  - ratingCount (total reviews)
```

---

### ✅ 9. Thông Báo (Notification System)

**Files:** `src/models/Notification.js`, `src/controllers/notification.controller.js`

```javascript
Notification:
  - user (ref)
  - type: 'info' | 'warning' | 'alert'
  - title
  - message
  - readAt (timestamp)
  - meta (object, thêm dữ liệu tùy ý)
  - timestamps
```

**Chức năng:**
- ✅ Gửi thông báo cho người dùng
- ✅ Theo dõi trạng thái đã đọc
- ✅ Phân loại thông báo (info, warning, alert)
- ✅ Lưu metadata cho context

---

### ✅ 10. Các Tính Năng Hỗ Trợ

#### 10.1 Địa Chỉ (Address)
- Lưu trữ cấu trúc trong User, Patient
- Fields: street, city, state, zip, country
- **Endpoints:** `/api/addresses`

#### 10.2 Quản Lý Vai Trò (Roles)
- Định nghĩa 4 vai trò: patient, doctor, admin, staff
- **Endpoints:** `/api/roles`

#### 10.3 Chuyên Khoa (Specialties)
- Danh sách chuyên khoa (Tim mạch, Nhi, v.v.)
- Gán cho bác sĩ
- **Endpoints:** `/api/specialties`

#### 10.4 Bảo Hiểm (Insurance)
- Thông tin bảo hiểm của bệnh nhân
- Fields: provider, policyNumber, coverage, validUntil
- **Endpoints:** `/api/insurances`

#### 10.5 Tải File (File Upload)
- Lưu trữ/quản lý tệp
- **Endpoints:** `/api/files`

#### 10.6 Nhân Viên (Staff)
- Quản lý nhân viên bệnh viện
- **Endpoints:** `/api/staff`

---

## 🔌 API Endpoints - Tóm Tắt

| Route | Mô Tả |
|-------|-------|
| `/api-docs` | Swagger UI — xem & thử API (OpenAPI 3) |
| `/openapi.json` | Spec OpenAPI dạng JSON |
| `/api/auth` | Đăng ký, đăng nhập, hồ sơ |
| `/api/users` | Danh sách User (admin); `?role=` tùy chọn |
| `/api/roles` | Quản lý vai trò |
| `/api/specialties` | Quản lý chuyên khoa |
| `/api/hospitals` | Quản lý bệnh viện |
| `/api/departments` | Quản lý khoa |
| `/api/doctors` | Quản lý bác sĩ |
| `/api/patients` | Quản lý bệnh nhân |
| `/api/schedules` | Quản lý lịch làm việc |
| `/api/appointments` | Đặt & quản lý lịch hẹn |
| `/api/medical-records` | Hồ sơ y tế |
| `/api/prescriptions` | Đơn thuốc |
| `/api/invoices` | Hóa đơn |
| `/api/payments` | Thanh toán |
| `/api/reviews` | Đánh giá |
| `/api/ratings` | Xếp hạng |
| `/api/tests` | Xét nghiệm |
| `/api/test-results` | Kết quả xét nghiệm |
| `/api/notifications` | Thông báo |
| `/api/addresses` | Quản lý địa chỉ |
| `/api/medicines` | Quản lý thuốc |
| `/api/insurances` | Quản lý bảo hiểm |
| `/api/files` | Tải file |
| `/api/staff` | Quản lý nhân viên |

---

## 🔒 Middleware

### 1. Authentication Middleware (`auth.middleware.js`)
```javascript
authMiddleware(req, res, next)
  - Kiểm tra Authorization header
  - Xác thực JWT token
  - Lôi kéo user từ database
  - Gán req.user

authorize(...roles)
  - Kiểm tra vai trò người dùng
  - Cho phép/chặn dựa trên roles
```

### 2. Error Middleware (`error.middleware.js`)
```javascript
errorMiddleware(err, req, res, next)
  - Log lỗi
  - Trả về status code & message
  - Format JSON response
```

### 3. Security Middleware (Built-in Express)
- `helmet()` - Đặt các header bảo mật HTTP
- `cors()` - Cho phép cross-origin requests
- `morgan()` - Log HTTP requests

---

## 📊 Quy Trình Luồng Chính

### Quy Trình Đặt Lịch & Khám Bệnh:

```
1. REGISTRATION & LOGIN
   User → Register/Login → Get JWT Token

2. DOCTOR SETUP
   Doctor → Create Schedule with Slots and Capacity

3. PATIENT BOOKING
   Patient → View Available Schedules →
   Patient → Create Appointment from Schedule →
   Schedule.bookedCount ↑ (auto close if full)

4. APPOINTMENT MANAGEMENT
   Doctor → View Appointments → Confirm Appointment →
   Appointment.status = 'confirmed'

5. MEDICAL CONSULTATION
   Doctor → Create Medical Record →
   Doctor → Create Prescription with Medicines →
   Doctor → Order Tests

6. BILLING
   System → Create Invoice (from appointment items) →
   Patient → View Invoice →
   Patient → Make Payment (cash/card/insurance/online)

7. FEEDBACK
   Patient → Submit Review & Rating →
   Doctor.rating ↑ (aggregate)

8. NOTIFICATIONS
   System → Send Notifications to relevant users
```

---

## 🛠️ Công Nghệ & Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",           // Web framework
    "mongoose": "^7.6.1",           // MongoDB ODM
    "jsonwebtoken": "^9.0.2",       // JWT authentication
    "bcryptjs": "^2.4.3",           // Password hashing
    "cors": "^2.8.5",               // CORS support
    "helmet": "^7.0.0",             // Security headers
    "morgan": "^1.10.0",            // HTTP logging
    "dotenv": "^16.3.1",            // Environment variables
    "express-async-errors": "^3.1.1", // Async error handling
    "joi": "^17.x",                 // Request validation
    "multer": "^2.x",               // Multipart file upload
    "socket.io": "^4.x",            // Realtime communication
    "swagger-ui-express": "^5.x"    // Swagger UI (/api-docs)
  },
  "devDependencies": {
    "nodemon": "^3.0.1"             // Dev server auto-reload
  }
}
```

---

## ⚙️ Cấu Hình

### Environment Variables (`.env`)
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/medireserve
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=1d
NODE_ENV=development
```

### Default Configuration
- **Port:** 4000
- **MongoDB:** mongodb://localhost:27017/medireserve
- **JWT Secret:** 'secret' (nếu không set env)
- **JWT Expiry:** '1d'

---

## 📈 Status Hiện Tại & Tình Trạng

### ✅ Hoàn Thành
- [x] Xác thực & Phân quyền (Authentication & Authorization)
- [x] Quản lý người dùng (Patient, Doctor, User)
- [x] Quản lý bệnh viện (Hospital, Department, Room)
- [x] Hệ thống lịch (Schedule, Shift)
- [x] Hệ thống đặt lịch (Appointment)
- [x] Hồ sơ y tế (Medical Record)
- [x] Đơn thuốc (Prescription)
- [x] Xét nghiệm (Test, TestResult)
- [x] Thanh toán & Hóa đơn (Payment, Invoice)
- [x] Đánh giá & Xếp hạng (Review, Rating)
- [x] Thông báo (Notification)
- [x] CRUD cho tất cả entities
- [x] Role-based authorization
- [x] Automatic schedule closure
- [x] Error middleware
- [x] Request validation (Joi): middleware `validate.middleware.js`, schema cho `/api/auth`, `/api/appointments`
- [x] API Documentation (Swagger UI: `/api-docs`, spec: `/openapi.json`, nguồn `src/docs/openapi.spec.js`)
- [x] API smoke test tự động cho toàn bộ route chính (`npm run test:api-smoke`, pass 32/32)
- [x] File upload storage thực tế bằng `multer` (multipart), lưu local tại `/uploads`, phục vụ static qua `GET /uploads/*`
- [x] Database transaction cho luồng đặt/hủy lịch hẹn bằng `mongoose.startSession()` + `withTransaction()`
- [x] Realtime socket bằng `socket.io` (emit sự kiện `appointment:created`, `appointment:cancelled`)
- [x] Frontend chức năng #1 (foundation): router, auth guard, role guard, app shell, axios client
- [x] Frontend chức năng #2: Authentication flow thật (login/register/profile với backend)
- [x] Frontend chức năng #3: Authorization UI (menu theo role + route theo role)
- [x] Frontend chức năng #4: Patient appointment cơ bản (xem lịch, đặt lịch, hủy lịch bằng dữ liệu thật)
- [x] Frontend chức năng #5: Đồng bộ transaction UI sau mutation (đồng bộ lại từ backend, chống lệch trạng thái)
- [x] Sửa lỗi backend được phát hiện qua smoke test:
  - [x] `review.controller.js`: map đúng `Patient._id` thay vì `User._id`
  - [x] `rating.controller.js`: map đúng `Patient._id` cho user role `patient`
  - [x] `fileUpload.controller.js`: đổi `file.remove()` sang `file.deleteOne()` để tránh lỗi 500

### ❌ Cần Hoàn Thành
- [ ] Frontend chức năng #6+: triển khai tuần tự các module theo `FRONTEND_INTEGRATION_PLAN.md`
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Hoàn thiện Joi cho các route còn lại (đã có middleware + auth + appointments)
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Database indexing optimization
- [ ] Logging system
- [ ] Rate limiting
- [ ] Caching layer (Redis)

---

## 🚀 Cách Chạy Dự Án

### Prerequisites
- Node.js (v14+)
- MongoDB (local hoặc Atlas)

### Installation
```bash
cd MediReserve
npm install
```

### Setup Environment
```bash
cp .env.example .env
# Edit .env với MongoDB URI và JWT secret
```

### Development
```bash
npm run dev      # Sử dụng nodemon (auto-reload)
```

### API Smoke Test (tự động)
```bash
npm run test:api-smoke
```

Kết quả hiện tại: **32/32 bước PASS**.

Frontend function #1 validation (workspace frontend/):
- `npm run lint`: PASS
- `npm run test`: PASS (2/2)
- `npm run build`: PASS

Frontend function #2 validation (workspace frontend/):
- `npm run lint`: PASS
- `npm run test`: PASS (2/2)
- `npm run build`: PASS

Frontend function #3 validation (workspace frontend/):
- `npm run lint`: PASS
- `npm run test`: PASS (7/7)
- `npm run build`: PASS

Frontend function #4 validation (workspace frontend/):
- `npm run lint`: PASS
- `npm run test`: PASS (9/9)
- `npm run build`: PASS

Frontend function #5 validation (workspace frontend/):
- `npm run lint`: PASS
- `npm run test`: PASS (13/13)
- `npm run build`: PASS

### Production
```bash
npm start        # Chạy với node
```

### Server sẽ khởi động tại
```
http://localhost:4000
GET / → { success: true, message: 'MediReserve API is running' }
```

---

## 📝 Notes

1. **Tất cả route** yêu cầu authentication (trừ register/login) thông qua JWT token trong header:
   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

2. **Role-based access**: Một số endpoints chỉ cho phép roles nhất định (ví dụ: chỉ doctor mới tạo schedule)

3. **Auto-cascade**: Khi appointment được tạo, schedule.bookedCount tự động tăng

4. **Transaction đã bật cho appointment**: Luồng create/cancel được bọc transaction để đồng bộ appointment và schedule.

5. **Realtime đã bật**: Hệ thống có socket event cho thay đổi lịch hẹn (`appointment:created`, `appointment:cancelled`).

6. **Email chưa được setup**: Nên thêm email notifications cho các sự kiện quan trọng

7. **Payment integration**: Hiện tại chỉ lưu trữ payment info, chưa tích hợp payment gateway thực

---

## 📞 Liên Hệ & Support

Nếu có bất kỳ câu hỏi hoặc cần hỗ trợ:
- Kiểm tra các models trong `src/models/`
- Kiểm tra controllers logic trong `src/controllers/`
- Kiểm tra routes definition trong `src/routes/`

---

**Cập nhật lần cuối:** 02/04/2026
**Status:** Đang phát triển (Development)
**Version:** 1.0.0

**Lưu ý quan trọng**: luôn luôn view lại file PROJECT_DOCUMENTATION.md để nắm được cấu trúc và hướng phát triển của dự án sau khi làm xong mỗi chức năng trước khi tiếp tục chức năng mới.(sau khi hoàn thành từng bước phải nhắc nhở tôi push lên git, và giúp tôi hoàn thành giai đoạn nào thì tích done là đã hoàn thành chức năng đó trong PROJECT_DOCUMENTATION.md)
