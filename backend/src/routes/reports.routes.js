const router = require('express').Router()
const { byProject, byUser, byUserSummary, mine } = require('../controllers/reports.controller')
const { auth, adminOnly } = require('../middleware/auth')

router.get('/mine', auth, mine)                              // any logged user
router.get('/by-project', auth, adminOnly, byProject)
router.get('/by-user', auth, adminOnly, byUser)
router.get('/by-user-summary', auth, adminOnly, byUserSummary)

module.exports = router
