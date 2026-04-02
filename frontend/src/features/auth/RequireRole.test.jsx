import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { RequireRole } from './RequireRole'
import { authStorage } from '../../shared/utils/authStorage'

describe('RequireRole', () => {
  it('redirects users without required role', () => {
    authStorage.setToken('token-staff')
    authStorage.setUser({ id: 's1', role: 'staff', name: 'Staff User' })

    render(
      <MemoryRouter initialEntries={['/quan-tri']}>
        <AuthProvider>
          <Routes>
            <Route path="/unauthorized" element={<div>Không được phép</div>} />
            <Route element={<RequireRole roles={['admin']} />}>
              <Route path="/quan-tri" element={<div>Trang quản trị</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Không được phép')).toBeInTheDocument()

    authStorage.clearToken()
    authStorage.clearUser()
  })

  it('allows users with required role', () => {
    authStorage.setToken('token-admin')
    authStorage.setUser({ id: 'a1', role: 'admin', name: 'Admin User' })

    render(
      <MemoryRouter initialEntries={['/quan-tri']}>
        <AuthProvider>
          <Routes>
            <Route path="/unauthorized" element={<div>Không được phép</div>} />
            <Route element={<RequireRole roles={['admin']} />}>
              <Route path="/quan-tri" element={<div>Trang quản trị</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Trang quản trị')).toBeInTheDocument()

    authStorage.clearToken()
    authStorage.clearUser()
  })
})
