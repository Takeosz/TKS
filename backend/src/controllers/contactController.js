const pool = require('../database/connection')

const createContact = async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const subject = String(req.body.subject || '').trim()
  const message = String(req.body.message || '').trim()
  const service = String(req.body.service || '').trim()
  const timeline = String(req.body.timeline || '').trim()
  const budget = String(req.body.budget || '').trim()

  if (!name || !email || !subject || !message || name.length > 120 || email.length > 160 || subject.length > 180 || message.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Preencha todos os campos do formulário.',
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Informe um e-mail válido.' })
  }

  try {
    await pool.query(
      `INSERT INTO leads (name, email, subject, message, service, timeline, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, email, subject, message, service || null, timeline || null, budget || null]
    )

    return res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso.',
    })
  } catch (error) {
    console.error('Erro ao registrar contato:', error)
    return res.status(500).json({
      success: false,
      message: 'Não foi possível enviar sua mensagem agora.',
    })
  }
}

module.exports = { createContact }
