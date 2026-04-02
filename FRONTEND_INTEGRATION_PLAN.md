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
- Backend da co API REST cho cac module chinh: auth, users, roles, hospitals, departments, doctors, patients, schedules, appointments, medical-records, prescriptions, invoices, payments, reviews, ratings, tests, test-results, notifications, files, staff, addresses, medicines, insurances.
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
- Quan ly tai chinh co ban:
  - Invoice: /api/invoices
  - Payment: /api/payments

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
- Invoice/payment view co ban.

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
12. Invoice/payment views.
13. Hoan thien UX, test E2E, toi uu hieu nang.

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
  - Login hien tai dang o che do foundation (demo session) de test guard.
  - Chuc nang #2 se ket noi login/register voi backend /api/auth.

### Chuc nang #2 tro di
- Trang thai: CHUA BAT DAU

---
Cap nhat: 2026-04-02
Trang thai: Planning updated theo backend moi (upload multipart + transaction + socket)
