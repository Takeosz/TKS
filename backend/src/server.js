const express = require('express')
const cors = require('cors')
const http = require('http')
const path = require('path')
const { Server } = require('socket.io')
const { rateLimit } = require('express-rate-limit')

require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const projectsRoutes = require('./routes/projectsRoutes')
const servicesRoutes = require('./routes/servicesRoutes')
const messagesRoutes = require('./routes/messagesRoutes')
const contactRoutes = require('./routes/contactRoutes')
const leadRoutes = require('./routes/leadRoutes')
const aiRoutes = require('./routes/aiRoutes')

const {
  setSocketIO,
} = require('./controllers/messageController')
const initializeDatabase = require('./database/initialize')

const app = express()

// =========================
// CONFIGURAÇÕES
// =========================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'https://tks-psi.vercel.app'

const PORT =
  process.env.PORT || 3000

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://tks-psi.vercel.app',
  'https://www.tks-psi.vercel.app',
  FRONTEND_URL,
]

// =========================
// CORS
// =========================

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        callback(null, true)
        return
      }

      callback(new Error('CORS não permitido para esta origem'))
    },
    credentials: true,
  })
)

// =========================
// JSON
// =========================

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  skip: () => process.env.NODE_ENV !== 'production',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
})

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
  },
})

app.use('/api/projects/public', publicRateLimit)
app.use('/api/services/public', publicRateLimit)
app.use('/api/contact', publicRateLimit)
app.use('/api/auth/login', loginRateLimit)

// =========================
// SERVIDOR HTTP
// =========================

const server = http.createServer(app)

// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
    ],
    credentials: true,
  },
})

// Entrega Socket.IO para o controller
setSocketIO(io)

// =========================
// CONEXÕES SOCKET.IO
// =========================

io.on('connection', (socket) => {
  console.log(
    `🟢 Socket conectado: ${socket.id}`
  )

  // =========================
  // ENTRAR NA SALA DO USUÁRIO
  // =========================

  socket.on('join_chat', (userId) => {
    const id = Number(userId)

    if (
      !id ||
      Number.isNaN(id) ||
      id <= 0
    ) {
      console.log(
        '⚠️ ID de usuário inválido no Socket.IO.'
      )

      return
    }

    const room = `user_${id}`

    socket.join(room)

    console.log(
      `💬 Usuário ${id} entrou na sala ${room}`
    )
  })

  // =========================
  // DESCONECTAR
  // =========================

  socket.on('disconnect', (reason) => {
    console.log(
      `🔴 Socket desconectado: ${socket.id}`
    )

    console.log(
      `Motivo: ${reason}`
    )
  })
})

// =========================
// ROTA PRINCIPAL
// =========================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message:
      'TKS Technology Solutions API funcionando.',
  })
})

// =========================
// ROTAS DA API
// =========================

app.use(
  '/api/auth',
  authRoutes
)

app.use(
  '/api/users',
  userRoutes
)

app.use(
  '/api/projects',
  projectsRoutes
)

app.use(
  '/api/services',
  servicesRoutes
)

app.use(
  '/api/messages',
  messagesRoutes
)

app.use('/api/contact', contactRoutes)

app.use('/api/leads', leadRoutes)

app.use('/api/ai', aiRoutes)

// =========================
// ROTA 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      'Rota não encontrada.',
  })
})

// =========================
// ERROS
// =========================

app.use(
  (err, req, res, next) => {
    if (
      err instanceof SyntaxError &&
      err.status === 400 &&
      'body' in err
    ) {
      return res.status(400).json({
        success: false,
        message:
          'JSON inválido. Envie a mensagem no formato correto.',
      })
    }

    console.error(
      'Erro interno:',
      err
    )

    return res.status(500).json({
      success: false,
      message:
        'Erro interno do servidor.',
    })
  }
)

// =========================
// INICIAR SERVIDOR
// =========================

initializeDatabase()
  .then(() => server.listen(
    PORT,
    () => {
    console.log(
      '================================='
    )

    console.log(
      'TKS TECHNOLOGY SOLUTIONS'
    )

    console.log(
      '================================='
    )

    console.log(
      `Servidor rodando na porta ${PORT}`
    )

    console.log(
      `http://localhost:${PORT}`
    )

    console.log(
      '💬 Chat em tempo real: ATIVO'
    )

    console.log(
      `🌐 Frontend: ${FRONTEND_URL}`
    )

    console.log(
      '================================='
    )
    }
  ))
  .catch((error) => {
    console.error('Não foi possível preparar o banco de dados:', error)
    process.exit(1)
  })
