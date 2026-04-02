import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ROLE_HOME_PATH } from '../../shared/constants/roles'

export function RoleHomeRedirect() {
  const { user } = useAuth()
  const targetPath = ROLE_HOME_PATH[user?.role] || '/unauthorized'

  return <Navigate to={targetPath} replace />
}
