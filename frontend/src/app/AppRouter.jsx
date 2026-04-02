import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import { RequireAuth } from '../features/auth/RequireAuth'
import { RequireRole } from '../features/auth/RequireRole'
import { RoleHomeRedirect } from '../features/auth/RoleHomeRedirect'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AdminPage } from '../pages/AdminPage'
import { PatientPage } from '../pages/PatientPage'
import { DoctorPage } from '../pages/DoctorPage'
import { StaffPage } from '../pages/StaffPage'
import { FileManagerPage } from '../pages/FileManagerPage'
import { BillingPage } from '../pages/BillingPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/app" element={<RoleHomeRedirect />} />
          <Route path="/tong-quan" element={<DashboardPage />} />
          <Route path="/quan-ly-tep" element={<FileManagerPage />} />

          <Route element={<RequireRole roles={['patient']} />}>
            <Route path="/benh-nhan" element={<PatientPage />} />
            <Route path="/thanh-toan" element={<BillingPage />} />
          </Route>

          <Route element={<RequireRole roles={['doctor']} />}>
            <Route path="/bac-si" element={<DoctorPage />} />
          </Route>

          <Route element={<RequireRole roles={['staff']} />}>
            <Route path="/nhan-vien" element={<StaffPage />} />
          </Route>

          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="/quan-tri" element={<AdminPage />} />
            <Route path="/admin" element={<Navigate to="/quan-tri" replace />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
