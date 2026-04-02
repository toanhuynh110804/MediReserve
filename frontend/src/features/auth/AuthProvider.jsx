import { useMemo, useState } from 'react'
import { authStorage } from '../../shared/utils/authStorage'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authStorage.getToken())
  const [user, setUser] = useState(() => authStorage.getUser())

  const login = ({ token: nextToken, user: nextUser }) => {
    authStorage.setToken(nextToken)
    authStorage.setUser(nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }

  const logout = () => {
    authStorage.clearToken()
    authStorage.clearUser()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
