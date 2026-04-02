import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireRole({ roles = [] }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
