const express = require('express')
const auth = require('../middlewares/authMiddleware')
const { requireTeam } = require('../middlewares/roleMiddleware')
const { getLeads, updateLead, getDashboardMetrics } = require('../controllers/leadController')

const router = express.Router()
router.get('/', auth, requireTeam, getLeads)
router.get('/metrics', auth, requireTeam, getDashboardMetrics)
router.put('/:id', auth, requireTeam, updateLead)

module.exports = router
