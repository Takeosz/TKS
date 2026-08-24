const pool = require('../database/connection')

const requireRoles = (roles) => async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    )

    if (!roles.includes(result.rows[0]?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem realizar esta ação.',
      })
    }

    return next()
  } catch (error) {
    console.error('Erro ao validar permissão:', error)
    return res.status(500).json({
      success: false,
      message: 'Não foi possível validar sua permissão.',
    })
  }
}

const requireAdmin = requireRoles(['admin'])
const requireTeam = requireRoles(['admin', 'manager'])

module.exports = { requireAdmin, requireTeam }
