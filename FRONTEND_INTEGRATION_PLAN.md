# Ke hoach tich hop Frontend cho MediReserve

## 1. Muc tieu va pham vi
- Muc tieu: Xay dung ung dung frontend de ket noi day du voi backend MediReserve hien tai.
- Nguyen tac: Lap ke hoach truoc, chua code frontend o giai doan nay.
- Pham vi version 1 (MVP):
  - Dang ky, dang nhap, dang xuat.
  - Xem/chinh sua profile theo role.
  - Benh nhan: tim bac si, xem lich, dat lich, quan ly lich hen.
  - Bac si: xem lich, cap nhat trang thai lich hen, quan ly ho so y te co ban.
  - Admin/Staff: quan ly danh muc (hospital, department, specialty, medicine, insurance), quan ly user/staff, xem bao cao co ban.

## 2. Hien trang backend (co so de tich hop)
- Backend da co API REST cho cac module chinh: auth, users, roles, hospitals, departments, doctors, patients, schedules, appointments, medical-records, prescriptions, reviews, ratings, tests, test-results, notifications, files, staff, addresses, medicines, insurances.
- Auth su dung JWT Bearer token.
- Middleware validation Joi da san sang.
- Swagger/OpenAPI da mount, co the dung lam hop dong API khi frontend tich hop.
- Da ho tro upload file that (multipart/form-data) cho endpoint /api/files voi field file.
- Da ho tro realtime bang Socket.IO, co su kien appointment:created va appointment:cancelled.
- Da bo sung transaction cho luong tao/huy lich hen de dam bao du lieu appointment va schedule dong bo.

## 2.1 Dieu can bo sung vao ke hoach tich hop
- Frontend phai gui dung content-type multipart/form-data khi upload file.
- Frontend can co co che lang nghe socket de cap nhat danh sach lich hen theo thoi gian thuc.
- Frontend can tranh optimistic update qua som voi cac API co transaction; uu tien refetch sau khi API thanh cong.
- Frontend can follow chinh xac method huy lich: POST /api/appointments/:id/cancel.

## 3. Dinh huong cong nghe frontend
- Framework de xuat: React + Vite.
- Router: React Router.
- State management:
  - Server state: TanStack Query (React Query).
  - Client state nhe: Context API hoac Zustand.
- Form + validate: React Hook Form + Zod.
- HTTP client: Axios (interceptor cho JWT, refresh flow neu can).
- Realtime client: socket.io-client.
- UI:
  - Chon 1 he thong component ro rang (VD: MUI hoac Ant Design).
  - Dat design tokens (mau, spacing, typo) ngay tu dau.
- Testing:
  - Unit/component: Vitest + React Testing Library.
  - E2E: Playwright (cho cac luong critical).

## 4. Kien truc frontend de xuat
## 4.1 Cau truc thu muc
```txt
frontend/
  src/
    app/
      providers/
      router/
      store/
    features/
      auth/
      appointments/
      schedules/
      doctors/
      patients/
      medical-records/
      admin/
    shared/
      api/
      components/
      hooks/
      utils/
      constants/
      types/
    pages/
    layouts/
    styles/
```

## 4.2 Nguyen tac kien truc
- Tach theo feature module de de mo rong.
- Moi feature co: API service, hooks, components, pages, types.
- Route guard theo role:
  - Public route: login/register.
  - Private route: can token hop le.
  - Role route: patient, doctor, admin, staff.
- Xy ly loi tap trung:
  - 401: chuyen login.
  - 403: thong bao khong du quyen.
  - 5xx: thong bao he thong va log chi tiet.
- Nguyen tac dong bo du lieu voi backend:
  - Sau create/cancel appointment: invalidation query appointments + schedules.
  - Su kien socket chi dung de trigger refetch (khong patch state mutipath thu cong o ban dau).
  - Upload file thanh cong thi luu metadata tu response, khong tu tao URL o frontend.

## 5. Mapping man hinh frontend voi API
## 5.1 Public
- Login page -> POST /api/auth/login
- Register page -> POST /api/auth/register

## 5.2 Nguoi dung da dang nhap (chung)
- Profile page -> GET /api/auth/profile
- Notification center -> GET /api/notifications, POST /api/notifications/:id/read
- File manager (ho so dinh kem) -> GET /api/files, POST /api/files (multipart), GET /api/files/:id, DELETE /api/files/:id

## 5.3 Benh nhan
- Tim bac si/chuyen khoa -> GET /api/doctors, GET /api/specialties
- Xem lich trong -> GET /api/schedules
- Dat lich -> POST /api/appointments
- Danh sach lich hen cua toi -> GET /api/appointments
- Huy lich -> POST /api/appointments/:id/cancel
- Xem don thuoc/ho so y te -> GET /api/prescriptions, GET /api/medical-records

## 5.4 Bac si
- Lich lam viec cua toi -> GET /api/schedules
- Danh sach benh nhan hen kham -> GET /api/appointments
- Cap nhat trang thai lich hen -> PUT /api/appointments/:id
- Tao/cap nhat ho so y te -> POST/PUT /api/medical-records
- Tao don thuoc -> POST /api/prescriptions

## 5.5 Admin/Staff
- Quan ly danh muc:
  - Hospital: /api/hospitals
  - Department: /api/departments
  - Specialty: /api/specialties
  - Medicine: /api/medicines
  - Insurance: /api/insurances
- Quan ly nguoi dung va nhan su:
  - Users: /api/users
  - Staff: /api/staff
  - Roles: /api/roles

## 5.6 Realtime mapping (Socket)
- Ket noi socket sau khi login thanh cong.
- Emit join-user-room kem userId sau khi co profile.
- Lang nghe event:
  - appointment:created -> refetch appointments + schedules lien quan.
  - appointment:cancelled -> refetch appointments + schedules lien quan.

## 6. Ke hoach trien khai theo giai doan
## Giai doan 0 - Chuan bi (0.5-1 ngay)
- Xac nhan scope MVP voi team.
- Dong bo hop dong API voi backend (status code, payload, paging/filter).
- Chot stack frontend va quy uoc coding.
- Chot quy uoc realtime event name + payload shape voi backend.
- Chot quy uoc upload file (field name=file, gioi han dung luong, mime types).

## Giai doan 1 - Khoi tao du an frontend (1 ngay)
- Tao project React + Vite.
- Cau hinh eslint/prettier/husky/lint-staged.
- Cau hinh env: API_BASE_URL, APP_ENV.
- Tao skeleton layout, router, auth guard.

## Giai doan 2 - Auth + Core shell (1-2 ngay)
- Man hinh login/register.
- Luu token an toan (uu tien memory + fallback localStorage theo quyet dinh bao mat).
- Axios interceptor + xu ly loi chuan.
- Header/sidebar/navigation theo role.
- Tao socket provider (connect/disconnect theo trang thai dang nhap).

## Giai doan 3 - Patient flow (3-4 ngay)
- Danh sach bac si/chuyen khoa + bo loc.
- Danh sach lich + dat lich + huy lich.
- Lich hen cua toi + chi tiet.
- Trang profile benh nhan.
- Dong bo UI voi transaction flow: sau dat/huy lich, uu tien cho API response va refetch.

## Giai doan 4 - Doctor flow (2-3 ngay)
- Dashboard lich kham.
- Danh sach lich hen theo ngay/trang thai.
- Cap nhat trang thai lich hen.
- Tao/cap nhat medical record va prescription.

## Giai doan 5 - Admin/Staff flow (3-4 ngay)
- CRUD danh muc he thong.
- CRUD staff/users/roles (theo quyen).

## Giai doan 6 - Hoan thien chat luong (2-3 ngay)
- Skeleton/loading/empty/error states.
- Responsive mobile/tablet/desktop.
- Accessibility co ban (focus, aria labels, color contrast).
- Test unit cho component quan trong.
- E2E cho cac luong critical: login -> dat lich -> huy lich.
- E2E bo sung: upload file multipart + nhan cap nhat realtime appointment tren 2 tab.

## Giai doan 7 - UAT va release (1-2 ngay)
- UAT cung nghiep vu.
- Fix bug theo muc uu tien.
- Chot release notes va checklist deploy.

## 7. Data contract va quy uoc tich hop
- Tao file API contract mapping trong frontend (module -> endpoint -> request -> response -> error).
- Chuan hoa paginated response (neu backend ho tro).
- Chuan hoa format date/time va timezone.
- Quy uoc message loi hien thi cho user khong lo thong tin noi bo.
- Contract cho upload:
  - Request: multipart/form-data, bat buoc field file.
  - Response: metadata file (id, url, filename, mimeType, size).
- Contract cho appointment transaction:
  - Frontend khong gia dinh bookedCount local la nguon su that.
  - Luon dong bo lai tu GET schedules sau mutation.
- Contract cho socket:
  - Event vao: join-user-room { userId }.
  - Event ra: appointment:created, appointment:cancelled.

## 8. Bao mat va van hanh
- Khong hard-code secret tren frontend.
- JWT khong ghi log.
- Validate input o frontend de nang UX (khong thay the validation backend).
- Cau hinh CORS va domain production ro rang.
- Bat security headers o reverse proxy/CDN neu co.
- Khong render truc tiep file URL neu khong thuoc owner duoc phep.
- Retry policy co gioi han cho mutation de tranh goi lap trong tinh huong mang chap chon.

## 9. Ke hoach test
- Unit test:
  - Form validation.
  - Role guard.
  - Utility format date/currency.
  - Upload helper (build FormData, mapping response).
- Integration test:
  - API hooks voi mock server.
  - Socket listener hooks (event -> query invalidation).
- E2E:
  - Dang nhap thanh cong/that bai.
  - Dat lich, xem lich, huy lich.
  - Kiem tra phan quyen truy cap route.
  - Upload file, xem file, xoa file.
  - 2 user sessions nhan realtime update sau khi tao/huy appointment.

## 10. Rui ro va giai phap
- Rui ro: API chua dong nhat schema giua module.
  - Giai phap: Chot OpenAPI va test smoke API truoc khi frontend coding.
- Rui ro: Role phuc tap gay sai permission.
  - Giai phap: Viet ma tran role-permission ngay tu dau.
- Rui ro: Xu ly date/time sai timezone.
  - Giai phap: Chuan hoa UTC trong API, convert o UI.
- Rui ro: Scope mo rong qua nhanh.
  - Giai phap: Giu MVP, dua backlog pha 2.
- Rui ro: Lech trang thai do mutation + socket den khac thu tu.
  - Giai phap: Socket chi trigger refetch, uu tien du lieu tu API GET.
- Rui ro: Upload loi do sai field name hoac mime type.
  - Giai phap: Dong bo field file, validate client-side truoc khi submit.

## 11. Nhan su de xuat
- 1 Frontend lead.
- 1-2 Frontend dev.
- 1 QA (part-time/full-time tuy quy mo).
- 1 Backend support de lock API contract.

## 12. Tien do du kien tong the
- Tong thoi gian MVP: 14-20 ngay lam viec.
- Co the chia sprint:
  - Sprint 1: Giai doan 0-2
  - Sprint 2: Giai doan 3-4
  - Sprint 3: Giai doan 5-7

## 13. Checklist truoc khi bat dau code frontend
- [ ] Chot pham vi MVP va backlog pha 2.
- [ ] Chot stack va coding standards.
- [ ] Chot API contract voi backend.
- [ ] Co mock data cho man hinh chua san endpoint.
- [ ] Co tai khoan test cho tung role: patient/doctor/admin/staff.
- [ ] Chot quy trinh review code + merge + release.
- [ ] Chot socket event contract va test plan realtime.
- [ ] Chot upload contract: field file, max size, mime type.
- [ ] Xac nhan API_BASE_URL va SOCKET_URL theo tung moi truong.

## 14. Deliverables cua giai doan lap ke hoach
- Tai lieu ke hoach nay.
- Ma tran man hinh -> API -> role.
- Danh sach acceptance criteria cho MVP.
- Backlog task chi tiet de dua vao sprint board.

## 15. Quy trinh thuc thi theo tung chuc nang (khuyen nghi ap dung)

Muc tieu phan nay: Trien khai frontend theo cach chia nho, xong tung chuc nang roi moi sang chuc nang tiep theo de de debug va giam rui ro.

### 15.1 Nguyen tac van hanh
- Chi lam 1 chuc nang trong 1 lan trien khai.
- Moi chuc nang phai di qua day du 7 buoc xu ly (phan 15.3) truoc khi chuyen sang chuc nang moi.
- Khong mo song song nhieu luong nghiep vu lon (vd: vua lam dat lich vua lam upload) trong cung mot nhanh.
- Moi khi xong 1 chuc nang: merge nho, test lai nhanh, cap nhat tai lieu, roi moi tiep tuc.

### 15.2 Thu tu uu tien chuc nang frontend (de tranh xung dot)
1. Nen tang ung dung: router, layout, auth guard, error boundary, axios client.
2. Authentication flow: login, register, profile bootstrap.
3. Authorization UI: role-based route + role-based menu.
4. Patient appointment co ban: list schedules, create appointment, cancel appointment.
5. Dong bo transaction tren UI: refetch appointments va schedules sau mutation.
6. Realtime socket: ket noi socket, lang nghe appointment:created va appointment:cancelled.
7. File upload multipart: upload, list, xem chi tiet, xoa file.
8. Doctor workspace: quan ly lich kham va cap nhat trang thai lich hen.
9. Medical records + prescriptions.
10. Admin/Staff catalog modules: hospitals, departments, specialties, medicines, insurances.
11. Staff/users/roles management.
12. Hoan thien UX, test E2E, toi uu hieu nang.

### 15.3 Quy trinh 7 buoc cho moi chuc nang
1. Xac nhan pham vi nho cua chuc nang:
  - Dinh nghia man hinh nao trong scope.
  - Dinh nghia role nao duoc phep dung.
2. Chot hop dong API:
  - Endpoint, method, request schema, response schema, error codes.
3. Trien khai data layer truoc UI:
  - Tao API service + hooks query/mutation.
  - Dinh nghia cache keys va invalidation rules.
4. Trien khai UI toi thieu:
  - Form/list/detail voi loading, empty, error state.
5. Ket noi behavior nang cao:
  - Neu co transaction: uu tien du lieu GET sau mutation.
  - Neu co socket: event chi trigger refetch.
6. Test truoc khi dong chuc nang:
  - Unit test cho logic chinh.
  - Manual test theo checklist role.
7. Dong chuc nang va tai lieu hoa:
  - Cap nhat PROJECT_DOCUMENTATION.
  - Cap nhat tien do trong ke hoach.
  - Merge/Pull va tag mốc.

### 15.4 Dinh nghia Done cho moi chuc nang
- API call thanh cong dung contract.
- UI hien thi dung 4 trang thai: loading, empty, success, error.
- Role khong hop le bi chan dung yeu cau.
- Co it nhat 1 test hoac checklist manual duoc luu lai.
- Da cap nhat tai lieu va checklist.

### 15.5 Co che quan ly loi de de truy vet
- Moi chuc nang dung branch rieng.
- Moi commit nho theo mot buoc xu ly, khong gop qua lon.
- Bat log co cau truc cho API errors o frontend.
- Co feature flag neu chuc nang anh huong rong.

### 15.6 Cach phoi hop giua ban va Copilot trong tung vong
1. Ban chon so thu tu chuc nang tiep theo (theo muc 15.2).
2. Copilot lap ke hoach vi mo cho dung chuc nang do.
3. Copilot code va test xong tung buoc trong muc 15.3.
4. Ban review nhanh + chot.
5. Copilot cap nhat tai lieu + nhac push git.

## 16. Tien do thuc thi frontend theo thu tu

### Chuc nang #1 - Nen tang ung dung
- Trang thai: DONE
- Pham vi hoan tat:
  - Router core voi route public/protected/role-gated.
  - App shell + navigation khung.
  - Auth provider + auth guard + role guard.
  - Axios http client + interceptor token.
  - Placeholder pages: home, login foundation, dashboard protected, admin protected.
- File chinh da tao/cap nhat:
  - frontend/src/app/AppRouter.jsx
  - frontend/src/features/auth/AuthProvider.jsx
  - frontend/src/features/auth/RequireAuth.jsx
  - frontend/src/features/auth/RequireRole.jsx
  - frontend/src/shared/api/httpClient.js
  - frontend/src/layouts/AppShell.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (2/2 tests)
  - npm run build: PASS
- Ghi chu:
  - Nen tang da duoc tai su dung cho chuc nang #2 ma khong pha vo router/guard.

### Chuc nang #2 - Authentication flow that
- Trang thai: DONE
- Pham vi hoan tat:
  - Dang nhap that qua API `POST /api/auth/login`.
  - Dang ky that qua API `POST /api/auth/register`.
  - Bootstrap profile qua API `GET /api/auth/profile` khi co token.
  - Bao ve route trong giai doan bootstrap phien (`Dang kiem tra phien dang nhap...`).
  - Bo login demo, thay bang form that co xu ly loading/error.
  - Bo sung route `/register` va lien ket dieu huong giua login/register.
- File chinh da tao/cap nhat:
  - frontend/src/shared/api/authApi.js
  - frontend/src/features/auth/AuthProvider.jsx
  - frontend/src/features/auth/RequireAuth.jsx
  - frontend/src/pages/LoginPage.jsx
  - frontend/src/pages/RegisterPage.jsx
  - frontend/src/app/AppRouter.jsx
  - frontend/.env.example
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (2/2 tests)
  - npm run build: PASS
- Ghi chu:
  - Auth flow da su dung du lieu backend that, khong con token demo.
  - Role value van giu `patient|doctor|staff|admin` de tuong thich backend.

### Chuc nang #3 - Authorization UI
- Trang thai: DONE
- Pham vi hoan tat:
  - Menu dieu huong hien thi theo role dang nhap.
  - Route theo role rieng: `/benh-nhan`, `/bac-si`, `/nhan-vien`, `/quan-tri`.
  - Route `/app` duoc doi thanh diem vao role-based (tu dong redirect den khu vuc role).
  - Giu route cu `/admin` theo huong redirect sang `/quan-tri` de tuong thich nguoc.
  - Role guard da duoc test cho truong hop dung role/sai role.
- File chinh da tao/cap nhat:
  - frontend/src/app/AppRouter.jsx
  - frontend/src/layouts/AppShell.jsx
  - frontend/src/layouts/navItems.js
  - frontend/src/shared/constants/roles.js
  - frontend/src/features/auth/RoleHomeRedirect.jsx
  - frontend/src/features/auth/RequireRole.test.jsx
  - frontend/src/layouts/navItems.test.js
  - frontend/src/pages/PatientPage.jsx
  - frontend/src/pages/DoctorPage.jsx
  - frontend/src/pages/StaffPage.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (7/7 tests)
  - npm run build: PASS

### Chuc nang #4 - Patient appointment co ban
- Trang thai: DONE
- Pham vi hoan tat (du lieu that):
  - Tai lich kham that tu API `GET /api/schedules`.
  - Tai danh sach bac si that tu API `GET /api/doctors` de hien thi ten bac si.
  - Dat lich that qua API `POST /api/appointments`.
  - Tai lich hen cua benh nhan that qua API `GET /api/appointments`.
  - Huy lich that qua API `POST /api/appointments/:id/cancel`.
  - Khong su dung du lieu ao trong luong patient appointment.
- File chinh da tao/cap nhat:
  - frontend/src/pages/PatientPage.jsx
  - frontend/src/shared/api/patientAppointmentsApi.js
  - frontend/src/features/patient/appointmentPayload.js
  - frontend/src/features/patient/appointmentPayload.test.js
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (9/9 tests)
  - npm run build: PASS

### Chuc nang #5 - Dong bo transaction tren UI
- Trang thai: DONE
- Pham vi hoan tat:
  - Sau dat/huy lich, UI khong cap nhat ao; luon dong bo lai tu backend theo pipeline chung.
  - Gom 3 nguon du lieu trong 1 snapshot dong bo: schedules + doctors + appointments.
  - Co co che chan ket qua cu (stale response guard) de tranh ghi de state sai thu tu response.
  - Co trang thai `dang dong bo` va `dang mutation`, khoa thao tac de tranh goi trung.
  - Hien thi moc thoi gian dong bo gan nhat de de doi chieu du lieu.
- File chinh da tao/cap nhat:
  - frontend/src/pages/PatientPage.jsx
  - frontend/src/features/patient/transactionSync.js
  - frontend/src/features/patient/transactionSync.test.js
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (13/13 tests)
  - npm run build: PASS

### Chuc nang #6 - Realtime socket integration
- Trang thai: DONE
- Pham vi hoan tat:
  - Socket client connect/disconnect theo trang thai dang nhap.
  - Ket noi socket trong AuthProvider, tro ket noi khi logout.
  - Lang nghe event: appointment:created va appointment:cancelled.
  - Khi nhan event, trigger refetch (khong cap nhat state ao).
  - Setup subscribe helper trong component can dung socket.
- File chinh da tao/cap nhat:
  - frontend/src/shared/realtime/socketService.js
  - frontend/src/features/auth/AuthProvider.jsx
  - frontend/src/pages/PatientPage.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (15/15 tests)
  - npm run build: PASS

### Chuc nang #7 - File upload multipart
- Trang thai: DONE
- Pham vi hoan tat:
  - Upload file qua API `POST /api/files` voi multipart/form-data.
  - Danh sach file da upload qua API `GET /api/files`.
  - Xoa file qua API `DELETE /api/files/:id`.
  - Hien thi form upload voi input file, button submit, loading state.
  - Hien thi danh sach file voi ten, kich thuoc, link download, button xoa.
  - Xu li loi upload bang thong bao user-friendly.
- File chinh da tao/cap nhat:
  - frontend/src/shared/api/fileApi.js
  - frontend/src/shared/api/fileApi.test.js
  - frontend/src/features/files/UploadForm.jsx
  - frontend/src/features/files/UploadForm.test.jsx
  - frontend/src/features/files/FileList.jsx
  - frontend/src/features/files/FileList.test.jsx
  - frontend/src/pages/FileManagerPage.jsx
  - frontend/src/app/AppRouter.jsx (route /quan-ly-tep)
  - frontend/src/layouts/navItems.js (them link)
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (30/30 tests)
  - npm run build: PASS

### Chuc nang #8 - Doctor workspace
- Trang thai: DONE
- Pham vi hoan tat:
  - Xem lich lam viec cua bac si (GET /api/schedules).
  - Xem danh sach benh nhan hen kham (GET /api/appointments).
  - Cap nhat trang thai lich hen (PUT /api/appointments/:id) voi cac trang thai:
    - pending -> confirmed / cancelled
    - confirmed -> completed / cancelled
  - Huy lich hen (POST /api/appointments/:id/cancel).
  - Hien thi danh sach lich lam (schedules) voi ngay, slot, suc chua, so bon, slot con trong, phong.
  - Hien thi bang lich hen cua benh nhan (appointments) voi ten benh nhan, ngay, trang thai, button hanh dong.
  - Filter danh sach lich hen theo trang thai (pending/confirmed/completed/cancelled).
  - Ket noi socket de nhan su kien appointment:created, appointment:cancelled, trigger refetch.
  - State machine validation: che do chuyen trang thai (pending khong the sang completed truc tiep).
- File chinh da tao/cap nhat:
  - frontend/src/shared/api/doctorApi.js
  - frontend/src/shared/api/doctorApi.test.js
  - frontend/src/features/doctor/appointmentHelpers.js
  - frontend/src/features/doctor/appointmentHelpers.test.js
  - frontend/src/features/doctor/DoctorScheduleCard.jsx
  - frontend/src/features/doctor/DoctorScheduleCard.test.jsx
  - frontend/src/features/doctor/AppointmentActionRow.jsx
  - frontend/src/features/doctor/AppointmentActionRow.test.jsx
  - frontend/src/pages/DoctorPage.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (66/66 tests)
  - npm run build: PASS

### Chuc nang #9 - Medical records + prescriptions
- Trang thai: DONE
- Pham vi hoan tat:
  - Workspace ho so kham duoc mo truc tiep tu bang lich hen cua bac si.
  - Nap doctor profile that qua `GET /api/doctors/me` de dung doctorId profile thay vi userId.
  - Tai danh sach ho so y te cua bac si qua `GET /api/medical-records?doctor=...`.
  - Tai danh sach don thuoc cua bac si qua `GET /api/prescriptions?doctor=...`.
  - Tai danh muc thuoc qua `GET /api/medicines` de ke don trong form.
  - Tao/cap nhat ho so y te cho appointment confirmed/completed.
  - Tao/cap nhat don thuoc gan voi medical record dang chon.
  - Chuan hoa payload: trieu chung text area -> array, dong thuoc -> items[] co quantity so.
  - Co placeholder ro rang khi chua chon appointment hoac chua tao medical record.
- File chinh da tao/cap nhat:
  - frontend/src/shared/api/doctorApi.js
  - frontend/src/shared/api/doctorApi.test.js
  - frontend/src/shared/api/medicalRecordApi.js
  - frontend/src/shared/api/medicalRecordApi.test.js
  - frontend/src/shared/api/prescriptionApi.js
  - frontend/src/shared/api/prescriptionApi.test.js
  - frontend/src/shared/api/medicineApi.js
  - frontend/src/shared/api/medicineApi.test.js
  - frontend/src/features/doctor/appointmentHelpers.js
  - frontend/src/features/doctor/appointmentHelpers.test.js
  - frontend/src/features/doctor/medicalRecordHelpers.js
  - frontend/src/features/doctor/medicalRecordHelpers.test.js
  - frontend/src/features/doctor/MedicalRecordForm.jsx
  - frontend/src/features/doctor/MedicalRecordForm.test.jsx
  - frontend/src/features/doctor/PrescriptionForm.jsx
  - frontend/src/features/doctor/PrescriptionForm.test.jsx
  - frontend/src/features/doctor/AppointmentActionRow.jsx
  - frontend/src/features/doctor/AppointmentActionRow.test.jsx
  - frontend/src/pages/DoctorPage.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (92/92 tests)
  - npm run build: PASS

### Chuc nang #10 - Admin/Staff catalog modules
- Trang thai: DONE
- Pham vi hoan tat:
  - Thay placeholder `AdminPage` va `StaffPage` bang catalog workspace co tab.
  - Workspace quan ly 5 nhom danh muc: hospital, department, specialty, medicine, insurance.
  - Nap du lieu dong bo tu backend: hospitals, departments, specialties, medicines, insurances, patients.
  - Admin co the tao/cap nhat toan bo 5 danh muc va xoa theo rule backend.
  - Staff co the xem toan bo danh muc, nhung chi tao/cap nhat medicine va insurance; nut xoa bi khoa neu khong du quyen.
  - Department form su dung select hospital; Insurance form su dung select patient.
  - Payload catalog duoc chuan hoa cho field nested address, number, date.
  - Co danh sach bang + form tao/sua trong cung mot workspace de giam nhay trang.
- File chinh da tao/cap nhat:
  - frontend/src/shared/api/catalogApi.js
  - frontend/src/shared/api/catalogApi.test.js
  - frontend/src/shared/api/patientApi.js
  - frontend/src/shared/api/patientApi.test.js
  - frontend/src/features/catalog/catalogConfig.js
  - frontend/src/features/catalog/catalogHelpers.js
  - frontend/src/features/catalog/catalogHelpers.test.js
  - frontend/src/features/catalog/CatalogManager.jsx
  - frontend/src/features/catalog/CatalogManager.test.jsx
  - frontend/src/pages/AdminPage.jsx
  - frontend/src/pages/StaffPage.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (108/108 tests)
  - npm run build: PASS

### Chuc nang #11 - Staff/users/roles management
- Trang thai: DONE
- Pham vi hoan tat:
  - Mo rong `AdminPage` bang panel quan ly `users`, `staff`, `roles` tach biet voi catalog workspace.
  - Danh sach users su dung `GET /api/users`, co filter theo role de admin ra quyet dinh nhanh.
  - CRUD ho so nhan su su dung `GET/POST/PUT/DELETE /api/staff`.
  - CRUD role su dung `GET/POST/PUT/DELETE /api/roles`.
  - Form nhan su lien ket voi user, hospital, department; co role noi bo va status.
  - Form role cho phep nhap permissions theo tung dong hoac dau phay, frontend chuan hoa thanh array.
  - Giu staff page rieng cho catalog-only; user management chi xuat hien o admin area de dung phan quyen backend.
- File chinh da tao/cap nhat:
  - frontend/src/shared/api/userManagementApi.js
  - frontend/src/shared/api/userManagementApi.test.js
  - frontend/src/features/admin/userManagementHelpers.js
  - frontend/src/features/admin/userManagementHelpers.test.js
  - frontend/src/features/admin/UserManagementPanel.jsx
  - frontend/src/features/admin/UserManagementPanel.test.jsx
  - frontend/src/pages/AdminPage.jsx
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (119/119 tests)
  - npm run build: PASS

### Chuc nang #13 - Hoan thien UX, E2E, toi uu hieu nang
- Trang thai: DONE
- Pham vi hoan tat:
  - Nang cap shell giao dien voi skip-link, footer thong tin ky thuat, session panel ro rang hon.
  - Bo sung `PageHero` va `StateNotice` de thong nhat hero, empty/loading/error feedback tren cac trang chinh.
  - Cai tien HomePage, DashboardPage, FileManagerPage theo huong ro thong tin hon va than thien mobile hon.
  - Thay alert blocking tren Dashboard bang trang thai inline co the theo doi lai.
  - Bo sung style cho tabs, tables, textarea, focus state, stat cards va panel grid.
  - Thiet lap Playwright (`playwright.config.js`, script `test:e2e`, `test:e2e:ui`).
  - Viet 3 luong E2E voi mocked network de khong phu thuoc backend runtime:
    - login redirect theo role patient,
    - patient booking flow,
    - admin catalog + user management flow.
  - Tach biet unit tests (`src/**/*`) va E2E tests (`tests/e2e/**`) trong cau hinh Vite/Vitest.
- File chinh da tao/cap nhat:
  - frontend/src/shared/components/PageHero.jsx
  - frontend/src/shared/components/StateNotice.jsx
  - frontend/src/layouts/AppShell.jsx
  - frontend/src/pages/HomePage.jsx
  - frontend/src/pages/DashboardPage.jsx
  - frontend/src/pages/FileManagerPage.jsx
  - frontend/src/index.css
  - frontend/vite.config.js
  - frontend/playwright.config.js
  - frontend/tests/e2e/helpers.js
  - frontend/tests/e2e/auth-flow.spec.js
  - frontend/tests/e2e/patient-booking.spec.js
  - frontend/tests/e2e/admin-management.spec.js
  - frontend/package.json
- Ket qua test:
  - npm run lint: PASS
  - npm run test: PASS (119/119 tests)
  - npm run build: PASS
  - npm run test:e2e: PASS (3/3 tests)

---
Cap nhat: 2026-04-03
Trang thai: Frontend da hoan thanh den chuc nang #13 (polish + E2E)
