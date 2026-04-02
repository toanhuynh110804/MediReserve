import { useCallback, useEffect, useMemo, useState } from 'react'
import { authStorage } from '../../shared/utils/authStorage'
import { AuthContext } from './auth-context'
import { loginApi, profileApi, registerApi } from '../../shared/api/authApi'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authStorage.getToken())
  const [user, setUser] = useState(() => authStorage.getUser())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const persistSession = useCallback(({ token: nextToken, user: nextUser }) => {
    authStorage.setToken(nextToken)
    authStorage.setUser(nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const login = useCallback(async (payload) => {
    const result = await loginApi(payload)
    persistSession(result)
    return result
  }, [persistSession])

  const register = useCallback(async (payload) => {
    const result = await registerApi(payload)
    persistSession(result)
    return result
  }, [persistSession])

  const logout = useCallback(() => {
    authStorage.clearToken()
    authStorage.clearUser()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsBootstrapping(false)
        return
      }

      if (user) {
        setIsBootstrapping(false)
        return
      }

      try {
        const { user: profileUser } = await profileApi()
        authStorage.setUser(profileUser)
        setUser(profileUser)
      } catch {
        logout()
      } finally {
        setIsBootstrapping(false)
      }
    }

    bootstrapAuth()
  }, [token, user, logout])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [token, user, isBootstrapping, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
