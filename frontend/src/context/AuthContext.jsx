import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { io } from 'socket.io-client'

import { SOCKET_URL } from '../config/api'
import { API_URL } from '../config/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token')
  })

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')

      return savedUser
        ? JSON.parse(savedUser)
        : null
    } catch (error) {
      localStorage.removeItem('user')
      return null
    }
  })

  const [socket, setSocket] = useState(null)

  const clearAuthState = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setSocket(null)
  }

  // =========================
  // SOCKET.IO
  // =========================

  useEffect(() => {
    if (!token || !user?.id) {
      setSocket(null)
      return
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
    })

    newSocket.on('connect', () => {
      console.log(
        '🟢 Socket.IO conectado:',
        newSocket.id
      )

      newSocket.emit(
        'join_chat',
        Number(user.id)
      )
    })

    newSocket.on('disconnect', () => {
      console.log(
        '🔴 Socket.IO desconectado'
      )
    })

    newSocket.on('connect_error', (error) => {
      console.error(
        '❌ Erro no Socket.IO:',
        error.message
      )
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
    }
  }, [token, user?.id])

  useEffect(() => {
    if (!token) return

    fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            clearAuthState()
          }

          return null
        }

        return response.json()
      })
      .then((data) => {
        if (data?.success && data.user) {
          updateUser(data.user)
        }
      })
      .catch((error) => console.error('Erro ao sincronizar perfil:', error))
  }, [token])

  // =========================
  // LOGIN
  // =========================

  const login = (data) => {
    if (!data?.token || !data?.user) {
      return false
    }

    localStorage.setItem(
      'token',
      data.token
    )

    localStorage.setItem(
      'user',
      JSON.stringify(data.user)
    )

    setToken(data.token)
    setUser(data.user)

    return true
  }

  const updateUser = (updatedUser) => {
    if (!updatedUser) {
      return
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    if (socket) {
      socket.disconnect()
    }

    clearAuthState()
  }

  // =========================
  // AUTENTICAÇÃO
  // =========================

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        socket,
        login,
        updateUser,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
