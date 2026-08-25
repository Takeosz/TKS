import { io } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://tks-api.onrender.com')

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
})

export default socket