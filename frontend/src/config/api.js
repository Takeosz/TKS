const baseUrl =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://tks-api.onrender.com')

export const API_URL = `${baseUrl.replace(/\/$/, '')}/api`
export const SOCKET_URL = baseUrl.replace(/\/$/, '')
