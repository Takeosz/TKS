const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_URL = `${baseUrl.replace(/\/$/, '')}/api`
export const SOCKET_URL = baseUrl.replace(/\/$/, '')
