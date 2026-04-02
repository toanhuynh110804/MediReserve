import { STORAGE_KEYS } from '../constants/storageKeys'

export const authStorage = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.token),
  setToken: (token) => localStorage.setItem(STORAGE_KEYS.token, token),
  clearToken: () => localStorage.removeItem(STORAGE_KEYS.token),
  getUser: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  setUser: (user) => localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(STORAGE_KEYS.user),
}
