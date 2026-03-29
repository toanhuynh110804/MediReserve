# MediReserve — Link & hướng test API (sau `npm start`)

**Base URL mặc định:** `http://localhost:4000`  
(Đổi port nếu trong `.env` có `PORT` khác.)

**Header khi cần đăng nhập:**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Hướng dẫn lấy token (JWT)

### Bước 1 — Chạy API

Trong thư mục dự án:

```bash
npm start
```

Đợi log dạng `Server started on http://localhost:4000` (hoặc port trong `.env`).

### Bước 2 — Gọi một trong hai endpoint (không cần token)

| Cách | Method | Link đầy đủ |
|------|--------|-------------|
| **Đăng ký** tài khoản mới | POST | `http://localhost:4000/api/auth/register` |
| **Đăng nhập** (đã có tài khoản) | POST | `http://localhost:4000/api/auth/login` |

### Bước 3 — Gửi JSON trong body

- **Đăng ký:** dùng mẫu JSON ở mục **JSON — Đăng ký** (phần 1, ngay bên dưới mục “Không cần token”).
- **Đăng nhập:** dùng mẫu JSON ở mục **JSON — Đăng nhập** kế tiếp.

Header bắt buộc: `Content-Type: application/json`.

### Bước 4 — Lấy giá trị `token` từ response

Response thành công có dạng (rút gọn):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "user": {
    "id": "...",
    "name": "Nguyen Van A",
    "email": "patient01@example.com",
    "role": "patient"
  }
}
```

**Copy nguyên chuỗi** sau `"token":` (không có dấu ngoặc kép thừa) — đó là JWT dùng cho các API khác.

### Bước 5 — Dùng token cho request sau

Thêm header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

(thay toàn bộ phần sau `Bearer ` bằng token vừa copy.)

### Gợi ý công cụ

- **Postman / Thunder Client / Insomnia:** tạo request POST → nhập link ở Bước 2 → tab **Body** → **raw** → **JSON** → Send → xem field `token` ở phần response.
- **curl** (Git Bash hoặc terminal hỗ trợ curl):

```bash
curl -X POST "http://localhost:4000/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"patient01@example.com\",\"password\":\"secret12\"}"
```

(PowerShell: có thể dùng `Invoke-RestMethod` hoặc đặt JSON trong file `body.json` rồi `curl -d @body.json`.)

### Kiểm tra token còn hợp lệ

Sau khi có token, gọi:

- **GET** `http://localhost:4000/api/auth/profile`  
  với header `Authorization: Bearer <token>`.  
  Trả về `200` và object `user` là token dùng đúng.

---

**Lưu ý:** Các chuỗi 24 ký tự hex dạng `507f1f77bcf86cd799439011` trong ví dụ là **ObjectId MongoDB** — thay bằng ID thật lấy từ response API hoặc MongoDB Compass.  
**Room:** Trong code hiện **không có** route `/api/rooms`; tạo document `Room` trong DB (hoặc seed) để có `roomId` dùng cho `Schedule` và `Appointment` nếu model yêu cầu.

---

## 1. Không cần token

| Chức năng | Method | Link |
|-----------|--------|------|
| Kiểm tra API chạy | GET | `http://localhost:4000/` |
| Đăng ký | POST | `http://localhost:4000/api/auth/register` |
| Đăng nhập | POST | `http://localhost:4000/api/auth/login` |

### JSON — Đăng ký

```json
{
  "name": "Nguyen Van A",
  "email": "patient01@example.com",
  "password": "secret12",
  "role": "patient",
  "phone": "0901234567",
  "address": {
    "street": "1 Le Loi",
    "city": "TP.HCM",
    "state": "",
    "zip": "700000",
    "country": "VN"
  }
}
```

`role` có thể bỏ (mặc định `patient`) hoặc một trong: `patient`, `doctor`, `admin`, `staff`.

### JSON — Đăng nhập

```json
{
  "email": "patient01@example.com",
  "password": "secret12"
}
```

---

## 2. Cần token (mọi route `/api/*` khác đều qua JWT)

Dưới đây: **Link đầy đủ** = `http://localhost:4000` + đường dẫn trong bảng.

### 2.1 Auth

| Chức năng | Method | Đường dẫn | Token | Ghi chú vai trò |
|-----------|--------|-----------|-------|-----------------|
| Hồ sơ user đăng nhập | GET | `/api/auth/profile` | Có | Mọi user đã đăng nhập |

Không cần body.

---

### 2.2 Users — **chỉ admin** (toàn bộ tài khoản đăng nhập)

| Chức năng | Method | Link đầy đủ |
|-----------|--------|-------------|
| Danh sách **User** (mọi role: patient, doctor, admin, staff) | GET | `http://localhost:4000/api/users` |
| Lọc theo một role | GET | `http://localhost:4000/api/users?role=patient` (thay `patient` bằng `doctor` / `admin` / `staff`) |

**Token:** bắt buộc user có role **admin**. Response: mảng user **không** có field `password`.

---

### 2.3 Roles — **chỉ admin** (toàn bộ nhóm `/api/roles`)

| Chức năng | Method | Đường dẫn |
|-----------|--------|-----------|
| Tạo role | POST | `/api/roles` |
| Danh sách | GET | `/api/roles` |
| Chi tiết | GET | `/api/roles/:id` |
| Cập nhật | PUT | `/api/roles/:id` |
| Xóa | DELETE | `/api/roles/:id` |

**POST body mẫu:**

```json
{
  "name": "reception",
  "permissions": ["read:appointments", "write:appointments"]
}
```

---

### 2.4 Hospitals

| Chức năng | Method | Đường dẫn | Token | Vai trò |
|-----------|--------|-----------|-------|---------|
| Danh sách | GET | `/api/hospitals` | Có | Mọi user đăng nhập |
| Chi tiết | GET | `/api/hospitals/:id` | Có | Mọi user đăng nhập |
| Tạo | POST | `/api/hospitals` | Có | **admin** |
| Sửa | PUT | `/api/hospitals/:id` | Có | **admin** |
| Xóa | DELETE | `/api/hospitals/:id` | Có | **admin** |

**POST / PUT body mẫu:**

```json
{
  "name": "Benh Vien Demo",
  "description": "Mo ta",
  "address": {
    "street": "123 ABC",
    "city": "Ha Noi",
    "state": "",
    "zip": "100000",
    "country": "VN"
  },
  "phone": "0241234567",
  "email": "contact@bv.demo",
  "website": "https://bv.demo"
}
```

---

### 2.5 Departments

| Chức năng | Method | Đường dẫn | Vai trò (tạo/sửa/xóa) |
|-----------|--------|-----------|------------------------|
| CRUD | GET/POST/GET/PUT/DELETE | `/api/departments`, `/api/departments/:id` | GET: mọi user; POST/PUT/DELETE: **admin** |

**POST body mẫu:**

```json
{
  "name": "Noi tong hop",
  "hospital": "507f1f77bcf86cd799439011",
  "description": "Khoa noi"
}
```

---

### 2.6 Doctors

| Chức năng | Method | Đường dẫn | Vai trò |
|-----------|--------|-----------|---------|
| Danh sách | GET | `/api/doctors` | Đăng nhập |
| Hồ sơ bác sĩ (theo user) | GET | `/api/doctors/me` | Đăng nhập (nên là doctor) |
| Chi tiết | GET | `/api/doctors/:id` | Đăng nhập |
| Tạo | POST | `/api/doctors` | **admin**, **staff** |
| Sửa | PUT | `/api/doctors/:id` | **admin**, **staff** |
| Xóa | DELETE | `/api/doctors/:id` | **admin** |

**POST body mẫu:**

```json
{
  "user": "507f1f77bcf86cd799439011",
  "specialties": ["507f1f77bcf86cd799439012"],
  "hospital": "507f1f77bcf86cd799439013",
  "department": "507f1f77bcf86cd799439014",
  "qualifications": "BS CKI",
  "experienceYears": 5,
  "bio": "Chuyen khoa noi",
  "phone": "0912345678",
  "active": true
}
```

---

### 2.7 Patients

| Chức năng | Method | Đường dẫn | Vai trò |
|-----------|--------|-----------|---------|
| Danh sách (quản lý bệnh nhân) | GET | `/api/patients` | **admin**, **staff**, **doctor** |
| Hồ sơ của tôi | GET | `/api/patients/me` | Đăng nhập |
| Tạo | POST | `/api/patients` | **admin**, **staff** |
| Chi tiết | GET | `/api/patients/:id` | **admin**, **staff**, **doctor** |
| Sửa / Xóa | PUT/DELETE | `/api/patients/:id` | PUT: admin, staff; DELETE: **admin** |

**POST body mẫu:**

```json
{
  "user": "507f1f77bcf86cd799439011",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "gender": "male",
  "bloodType": "O",
  "medicalHistory": ["cao huyet ap"],
  "allergies": ["penicillin"],
  "insurance": {
    "provider": "BHYT",
    "policyNumber": "BH123",
    "coverage": "80%",
    "validUntil": "2026-12-31T00:00:00.000Z"
  }
}
```

---

### 2.8 Specialties

| Chức năng | Method | Đường dẫn | Vai trò |
|-----------|--------|-----------|---------|
| GET | GET | `/api/specialties`, `/api/specialties/:id` | Đăng nhập |
| POST/PUT/DELETE | | | **admin** |

**POST body mẫu:**

```json
{
  "name": "Tim mach",
  "description": "Chuyen khoa tim"
}
```

---

### 2.9 Schedules

| Chức năng | Method | Đường dẫn | Vai trò |
|-----------|--------|-----------|---------|
| Danh sách (lọc query) | GET | `/api/schedules?doctor=...&hospital=...&department=...&date=2026-03-30` | Đăng nhập |
| Chi tiết | GET | `/api/schedules/:id` | Đăng nhập |
| Tạo | POST | `/api/schedules` | **admin**, **doctor**, **staff** |
| Sửa / Xóa | PUT/DELETE | `/api/schedules/:id` | **admin**, **doctor**, **staff** |

**POST body mẫu:**

```json
{
  "doctor": "507f1f77bcf86cd799439011",
  "room": "507f1f77bcf86cd799439012",
  "department": "507f1f77bcf86cd799439013",
  "hospital": "507f1f77bcf86cd799439014",
  "date": "2026-03-30T00:00:00.000Z",
  "slot": "morning",
  "capacity": 10,
  "status": "open"
}
```

---

### 2.10 Appointments (có Joi validation)

| Chức năng | Method | Đường dẫn | Vai trò |
|-----------|--------|-----------|---------|
| Danh sách (lọc `?status=`) | GET | `/api/appointments` | Đăng nhập (theo role tự lọc) |
| Đặt lịch | POST | `/api/appointments` | **patient**, **admin**, **staff** |
| Chi tiết | GET | `/api/appointments/:id` | Đăng nhập |
| Cập nhật | PUT | `/api/appointments/:id` | **admin**, **staff**, **doctor** |
| Hủy | POST | `/api/appointments/:id/cancel` | **patient**, **admin**, **staff**, **doctor** |

**POST tạo lịch — body mẫu:**

```json
{
  "patient": "507f1f77bcf86cd799439011",
  "doctor": "507f1f77bcf86cd799439012",
  "schedule": "507f1f77bcf86cd799439013",
  "room": "507f1f77bcf86cd799439014",
  "date": "2026-03-30T00:00:00.000Z",
  "time": "09:00",
  "notes": "Kham lan dau"
}
```

Nếu role là **patient**, có thể **bỏ** `patient` trong body — server tự gán từ profile bệnh nhân.

**POST hủy — body (tùy chọn):**

```json
{
  "cancelReason": "Ban viec dot xuat"
}
```

**PUT cập nhật — ví dụ:**

```json
{
  "status": "confirmed",
  "paymentStatus": "unpaid",
  "notes": "Da xac nhan"
}
```

---

### 2.11 Medical records, Prescriptions, Invoices, Payments

**Medical records** `/api/medical-records` — GET: admin, doctor, staff, patient | POST: doctor, admin, staff  

**POST body mẫu:**

```json
{
  "patient": "507f1f77bcf86cd799439011",
  "appointment": "507f1f77bcf86cd799439012",
  "doctor": "507f1f77bcf86cd799439013",
  "diagnosis": "Viem hong",
  "symptoms": ["dau hong", "sot"],
  "notes": "Nghi ngoi"
}
```

**Prescriptions** `/api/prescriptions` — POST: doctor, admin, staff  

**POST body mẫu:**

```json
{
  "medicalRecord": "507f1f77bcf86cd799439011",
  "doctor": "507f1f77bcf86cd799439012",
  "patient": "507f1f77bcf86cd799439013",
  "items": [
    {
      "medicine": "507f1f77bcf86cd799439014",
      "dosage": "2 vien x 3 lan/ngay",
      "quantity": 20,
      "instructions": "Sau an"
    }
  ],
  "note": "Uong du ngay",
  "status": "active"
}
```

**Invoices** `/api/invoices` — POST: admin, staff  

**POST body mẫu:**

```json
{
  "appointment": "507f1f77bcf86cd799439011",
  "patient": "507f1f77bcf86cd799439012",
  "doctor": "507f1f77bcf86cd799439013",
  "items": [
    { "title": "Kham benh", "amount": 200000 },
    { "title": "Xet nghiem", "amount": 150000 }
  ],
  "subTotal": 350000,
  "tax": 35000,
  "discount": 0,
  "total": 385000,
  "status": "unpaid"
}
```

**Payments** `/api/payments` — POST: admin, staff  

**POST body mẫu:**

```json
{
  "invoice": "507f1f77bcf86cd799439011",
  "appointment": "507f1f77bcf86cd799439012",
  "patient": "507f1f77bcf86cd799439013",
  "method": "cash",
  "amount": 385000,
  "status": "completed",
  "transactionId": "TXN-2026-001"
}
```

---

### 2.12 Reviews, Ratings

**Reviews** `/api/reviews` — POST: patient, admin, staff  

**POST body mẫu:**

```json
{
  "appointment": "507f1f77bcf86cd799439011",
  "patient": "507f1f77bcf86cd799439012",
  "doctor": "507f1f77bcf86cd799439013",
  "hospital": "507f1f77bcf86cd799439014",
  "rating": 5,
  "comment": "Bac si nhiet tinh",
  "status": "approved"
}
```

**Ratings** `/api/ratings` — POST: patient, admin, staff  

**POST body mẫu:**

```json
{
  "patient": "507f1f77bcf86cd799439011",
  "doctor": "507f1f77bcf86cd799439012",
  "hospital": "507f1f77bcf86cd799439013",
  "appointment": "507f1f77bcf86cd799439014",
  "score": 5,
  "comment": "Rat hai long"
}
```

---

### 2.13 Tests & Test results

**Tests** `/api/tests` — POST: admin, staff  

```json
{
  "name": "Cong thuc mau",
  "description": "Xet nghiem mau tong quat",
  "cost": 300000
}
```

**Test results** `/api/test-results` — POST: doctor, admin, staff  

```json
{
  "test": "507f1f77bcf86cd799439011",
  "medicalRecord": "507f1f77bcf86cd799439012",
  "patient": "507f1f77bcf86cd799439013",
  "doctor": "507f1f77bcf86cd799439014",
  "result": "Binh thuong",
  "fileUrl": "https://example.com/report.pdf",
  "date": "2026-03-29T10:00:00.000Z"
}
```

---

### 2.14 Medicines, Notifications, Files, Staff, Addresses, Insurances

**Medicines** `/api/medicines` — POST: admin, staff  

```json
{
  "name": "Paracetamol 500mg",
  "description": "Giam dau, ha sot",
  "unit": "vien",
  "price": 2000,
  "stock": 1000
}
```

**Notifications** `/api/notifications`

| Method | Đường dẫn | Vai trò |
|--------|-----------|---------|
| GET | `/api/notifications` | admin, staff, patient, doctor |
| POST | `/api/notifications` | **admin**, **staff** |
| POST | `/api/notifications/:id/read` | admin, staff, patient, doctor |
| DELETE | `/api/notifications/:id` | admin, staff, patient, doctor |

**POST tạo thông báo:**

```json
{
  "user": "507f1f77bcf86cd799439011",
  "type": "info",
  "title": "Nhac lich kham",
  "message": "Ban co lich kham ngay mai 8h",
  "meta": { "appointmentId": "507f1f77bcf86cd799439012" }
}
```

**Files** `/api/files` — POST: mọi user đăng nhập (owner tự gán từ server)  

```json
{
  "type": "lab",
  "filename": "ket-qua.pdf",
  "url": "https://example.com/files/ket-qua.pdf",
  "size": 102400,
  "mimeType": "application/pdf",
  "meta": { "note": "KQ xet nghiem" }
}
```

**Staff** `/api/staff` — **toàn bộ chỉ admin** (giống `/api/roles`).

**POST body mẫu:**

```json
{
  "user": "507f1f77bcf86cd799439011",
  "hospital": "507f1f77bcf86cd799439012",
  "department": "507f1f77bcf86cd799439013",
  "title": "Le tan",
  "role": "staff",
  "status": "active"
}
```

**Addresses** `/api/addresses` — POST: admin, staff  

```json
{
  "street": "10 Nguyen Hue",
  "city": "TP.HCM",
  "district": "Quan 1",
  "ward": "Phuong Ben Nghe",
  "zip": "700000",
  "country": "VN",
  "coords": { "lat": 10.7769, "lng": 106.7009 }
}
```

**Insurances** `/api/insurances` — POST: admin, staff  

```json
{
  "patient": "507f1f77bcf86cd799439011",
  "type": "private",
  "provider": "Bao hiem XYZ",
  "policyNumber": "POL-001",
  "coveragePercent": 80,
  "validFrom": "2026-01-01T00:00:00.000Z",
  "validUntil": "2027-01-01T00:00:00.000Z"
}
```

---

## 3. Tóm tắt token

| Tình huống | Token |
|------------|-------|
| `GET /` | Không |
| `POST /api/auth/register`, `POST /api/auth/login` | Không |
| **Tất cả** các URL còn lại (`/api/...`) | **Bắt buộc** `Authorization: Bearer ...` |
| `/api/roles`, `/api/staff` | Token + user có role **admin** |
| Một số POST/PUT/DELETE khác | Thêm điều kiện **role** như trong bảng từng mục |

---

*File này phục vụ test thủ công (Postman, Thunder Client, curl). Cập nhật khi thêm route hoặc đổi validation trong code.*
