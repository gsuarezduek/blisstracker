const router = require('express').Router()
const { byProject, byUser, byUserSummary } = require('../controllers/reports.controller')
const { auth, adminOnly } = require('../middleware/auth')

router.use(auth, adminOnly)
router.get('/by-project', byProject)
router.get('/by-user', byUser)
router.get('/by-user-summary', byUserSummary)

module.exports = router
