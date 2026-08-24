const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não informado.',
      })
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Formato do token inválido.',
      })
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no .env')

      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET não configurado no servidor.',
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = decoded

    next()
  } catch (error) {
    console.error('Erro na autenticação:', error.message)

    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
    })
  }
}

module.exports = authMiddleware