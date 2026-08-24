const express = require('express')
const router = express.Router()

const {
  getPublicProjects,
  getPublicProject,
  uploadProjectImage,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController')

const authMiddleware = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware')

// ========================================
// LISTAR PROJETOS
// Rota protegida
// ========================================

router.get('/public', getPublicProjects)
router.get('/:id', getPublicProject)
router.get('/', authMiddleware, getProjects)

// ========================================
// CRIAR PROJETO
// Rota protegida
// ========================================

router.post('/', authMiddleware, createProject)
router.post('/upload', authMiddleware, upload.single('image'), uploadProjectImage)
router.put('/:id', authMiddleware, updateProject)

// ========================================
// EXCLUIR PROJETO
// Rota protegida
// ========================================

router.delete('/:id', authMiddleware, deleteProject)

module.exports = router