import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { RequireAuth } from './RequireAuth'
import { authStorage } from '../../shared/utils/authStorage'

describe('RequireAuth', () => {
  it('redirects unauthenticated users to login', () => {
    authStorage.clearToken()
    authStorage.clearUser()

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<div>Private Page</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('allows authenticated users to access private routes', () => {
    authStorage.setToken('test-token')
    authStorage.setUser({ id: 'u1', role: 'patient', name: 'Tester' })

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<div>Private Page</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Private Page')).toBeInTheDocument()

    authStorage.clearToken()
    authStorage.clearUser()
  })
})
