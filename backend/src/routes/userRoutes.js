const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require('../middlewares/roleMiddleware')
const {
    getUsers,
    updateUserRole,
    updateProfile,
    uploadProfileAvatar,
} = require('../controllers/userController')
const upload = require('../middlewares/uploadMiddleware')

const router = express.Router();

// =========================
// PERFIL DO USUÁRIO
// =========================

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const result = await require('../database/connection').query(
            'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1',
            [req.user.id]
        )

        if (!result.rows[0]) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
        }

        return res.json({ success: true, user: result.rows[0] })
    } catch (error) {
        console.error('Erro ao consultar perfil:', error)
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' })
    }
});

router.put('/profile', authMiddleware, updateProfile)
router.post('/profile/avatar', authMiddleware, upload.single('image'), uploadProfileAvatar)

router.get('/', authMiddleware, requireAdmin, getUsers)

router.put('/:id/role', authMiddleware, requireAdmin, updateUserRole)

module.exports = router;
