export function resolveSocketUrl({ socketUrl, apiBaseUrl }) {
  return socketUrl || apiBaseUrl
}

export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  socketUrl: resolveSocketUrl({
    socketUrl: import.meta.env.VITE_SOCKET_URL,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  }),
}
