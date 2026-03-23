const router = require('express').Router()
const { byProject, byUser } = require('../controllers/reports.controller')
const { auth, adminOnly } = require('../middleware/auth')

router.use(auth, adminOnly)
router.get('/by-project', byProject)
router.get('/by-user', byUser)

module.exports = router
