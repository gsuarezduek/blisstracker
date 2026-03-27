const router = require('express').Router()
const { login, me, forgotPassword, resetPassword } = require('../controllers/auth.controller')
const { auth } = require('../middleware/auth')

router.post('/login', login)
router.get('/me', auth, me)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router
