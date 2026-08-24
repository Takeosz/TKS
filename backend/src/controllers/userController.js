const pool = require('../database/connection')
const { v2: cloudinary } = require('cloudinary')
const fs = require('fs/promises')
const path = require('path')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const allowedRoles = ['admin', 'manager', 'client']

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, avatar_url
       FROM users
       ORDER BY name ASC, email ASC`
    )

    return res.json({ success: true, users: result.rows })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

const updateUserRole = async (req, res) => {
  const userId = Number(req.params.id)
  const role = String(req.body.role || '').toLowerCase()

  if (!userId || !allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Usuário ou perfil inválido.',
    })
  }

  if (userId === Number(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: 'Você não pode alterar o seu próprio perfil.',
    })
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, name, email, role`,
      [role, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
    }

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      user: result.rows[0],
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

const updateProfile = async (req, res) => {
  const name = String(req.body.name || '').trim()

  if (!name || name.length > 120) {
    return res.status(400).json({ success: false, message: 'Informe um nome válido.' })
  }

  try {
    const result = await pool.query(
      `UPDATE users SET name = $1 WHERE id = $2
       RETURNING id, name, email, role, avatar_url`,
      [name, req.user.id]
    )

    return res.json({ success: true, message: 'Perfil atualizado com sucesso.', user: result.rows[0] })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
  }
}

const uploadProfileAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Selecione uma imagem.' })
  }

  try {
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
    let avatarUrl

    if (hasCloudinary) {
      const uploadedFile = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tks/profiles', resource_type: 'image', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
          (error, result) => error ? reject(error) : resolve(result)
        )
        stream.end(req.file.buffer)
      })
      avatarUrl = uploadedFile.secure_url
    } else {
      const extension = req.file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : req.file.mimetype.split('/')[1]
      const relativePath = path.join('uploads', 'profiles', `${req.user.id}.${extension}`)
      const absolutePath = path.join(__dirname, '..', '..', relativePath)
      await fs.mkdir(path.dirname(absolutePath), { recursive: true })
      await fs.writeFile(absolutePath, req.file.buffer)
      avatarUrl = `${req.protocol}://${req.get('host')}/${relativePath.replace(/\\/g, '/')}`
    }

    const result = await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2
       RETURNING id, name, email, role, avatar_url`,
      [avatarUrl, req.user.id]
    )

    return res.json({ success: true, message: 'Foto de perfil atualizada.', user: result.rows[0] })
  } catch (error) {
    console.error('Erro ao atualizar foto de perfil:', error)
    return res.status(502).json({ success: false, message: 'Não foi possível atualizar a foto.' })
  }
}

module.exports = { getUsers, updateUserRole, updateProfile, uploadProfileAvatar }
