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

## 3. Dinh huong cong nghe frontend
- Framework de xuat: React + Vite.
- Router: React Router.
- State management:
  - Server state: TanStack Query (React Query).
  - Client state nhe: Context API hoac Zustand.
- Form + validate: React Hook Form + Zod.
- HTTP client: Axios (interceptor cho JWT, refresh flow neu can).
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

## 5. Mapping man hinh frontend voi API
## 5.1 Public
- Login page -> POST /api/auth/login
- Register page -> POST /api/auth/register

## 5.2 Nguoi dung da dang nhap (chung)
- Profile page -> GET /api/auth/profile
- Notification center -> GET /api/notifications, POST /api/notifications/:id/read

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

## 6. Ke hoach trien khai theo giai doan
## Giai doan 0 - Chuan bi (0.5-1 ngay)
- Xac nhan scope MVP voi team.
- Dong bo hop dong API voi backend (status code, payload, paging/filter).
- Chot stack frontend va quy uoc coding.

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

## Giai doan 3 - Patient flow (3-4 ngay)
- Danh sach bac si/chuyen khoa + bo loc.
- Danh sach lich + dat lich + huy lich.
- Lich hen cua toi + chi tiet.
- Trang profile benh nhan.

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

## Giai doan 7 - UAT va release (1-2 ngay)
- UAT cung nghiep vu.
- Fix bug theo muc uu tien.
- Chot release notes va checklist deploy.

## 7. Data contract va quy uoc tich hop
- Tao file API contract mapping trong frontend (module -> endpoint -> request -> response -> error).
- Chuan hoa paginated response (neu backend ho tro).
- Chuan hoa format date/time va timezone.
- Quy uoc message loi hien thi cho user khong lo thong tin noi bo.

## 8. Bao mat va van hanh
- Khong hard-code secret tren frontend.
- JWT khong ghi log.
- Validate input o frontend de nang UX (khong thay the validation backend).
- Cau hinh CORS va domain production ro rang.
- Bat security headers o reverse proxy/CDN neu co.

## 9. Ke hoach test
- Unit test:
  - Form validation.
  - Role guard.
  - Utility format date/currency.
- Integration test:
  - API hooks voi mock server.
- E2E:
  - Dang nhap thanh cong/that bai.
  - Dat lich, xem lich, huy lich.
  - Kiem tra phan quyen truy cap route.

## 10. Rui ro va giai phap
- Rui ro: API chua dong nhat schema giua module.
  - Giai phap: Chot OpenAPI va test smoke API truoc khi frontend coding.
- Rui ro: Role phuc tap gay sai permission.
  - Giai phap: Viet ma tran role-permission ngay tu dau.
- Rui ro: Xu ly date/time sai timezone.
  - Giai phap: Chuan hoa UTC trong API, convert o UI.
- Rui ro: Scope mo rong qua nhanh.
  - Giai phap: Giu MVP, dua backlog pha 2.

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

## 14. Deliverables cua giai doan lap ke hoach
- Tai lieu ke hoach nay.
- Ma tran man hinh -> API -> role.
- Danh sach acceptance criteria cho MVP.
- Backlog task chi tiet de dua vao sprint board.

---
Cap nhat: 2026-04-02
Trang thai: Planning only (chua trien khai code frontend)
