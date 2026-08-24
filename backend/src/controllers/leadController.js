const pool = require('../database/connection')

const statuses = ['new', 'in_progress', 'proposal', 'won', 'lost']

const addLog = (userId, action) =>
  pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [userId, action])

const getLeads = async (req, res) => {
  const search = String(req.query.search || '').trim()
  const status = String(req.query.status || '').trim()
  const values = []
  const conditions = []

  if (search) {
    values.push(`%${search}%`)
    conditions.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length} OR subject ILIKE $${values.length})`)
  }
  if (status && statuses.includes(status)) {
    values.push(status)
    conditions.push(`status = $${values.length}`)
  }

  try {
    const result = await pool.query(
      `SELECT leads.*, users.name AS assigned_name
       FROM leads LEFT JOIN users ON users.id = leads.assigned_to
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY created_at DESC`,
      values
    )
    return res.json({ success: true, leads: result.rows })
  } catch (error) {
    console.error('Erro ao listar leads:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

const updateLead = async (req, res) => {
  const id = Number(req.params.id)
  const status = String(req.body.status || '').trim()
  const assignedTo = req.body.assigned_to ? Number(req.body.assigned_to) : null
  const followUpAt = req.body.follow_up_at ? new Date(req.body.follow_up_at) : null
  const notes = String(req.body.notes || '').trim() || null
  if (!id || !statuses.includes(status) || (assignedTo !== null && (!assignedTo || Number.isNaN(assignedTo))) || (followUpAt && Number.isNaN(followUpAt.getTime()))) {
    return res.status(400).json({ success: false, message: 'Lead ou status inválido.' })
  }
  try {
    const result = await pool.query(
      `UPDATE leads SET status = $1, assigned_to = $2, follow_up_at = $3, notes = $4,
       updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
      [status, assignedTo, followUpAt, notes, id]
    )
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Lead não encontrado.' })
    await addLog(req.user.id, `Atualizou o lead #${id} para ${status}`)
    return res.json({ success: true, lead: result.rows[0] })
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

const getDashboardMetrics = async (req, res) => {
  try {
    const [leadCounts, projects, services, activities, recentLeads] = await Promise.all([
      pool.query(`SELECT status, COUNT(*)::int AS total FROM leads GROUP BY status`),
      pool.query('SELECT COUNT(*)::int AS total FROM projects'),
      pool.query('SELECT COUNT(*)::int AS total FROM services'),
      pool.query(`SELECT a.id, a.action, a.created_at, u.name FROM activity_logs a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 8`),
      pool.query(`SELECT COUNT(*)::int AS total FROM leads WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'`),
    ])
    const totals = leadCounts.rows.reduce((acc, row) => ({ ...acc, [row.status]: row.total }), {})
    const totalLeads = Object.values(totals).reduce((total, value) => total + value, 0)
    const conversionRate = totalLeads ? Number(((totals.won || 0) / totalLeads * 100).toFixed(1)) : 0
    return res.json({ success: true, metrics: { leads: totals, projects: projects.rows[0].total, services: services.rows[0].total, activities: activities.rows, recentLeads: recentLeads.rows[0].total, conversionRate } })
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

module.exports = { getLeads, updateLead, getDashboardMetrics }
