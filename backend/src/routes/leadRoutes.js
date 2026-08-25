const express = require('express')
const auth = require('../middlewares/authMiddleware')
const { requireTeam } = require('../middlewares/roleMiddleware')
const { getLeads, getLeadHistory, updateLead, getDashboardMetrics } = require('../controllers/leadController')

const router = express.Router()
router.get('/', auth, requireTeam, getLeads)
router.get('/metrics', auth, requireTeam, getDashboardMetrics)
router.get('/:id/history', auth, requireTeam, getLeadHistory)
router.put('/:id', auth, requireTeam, updateLead)

module.exports = router
