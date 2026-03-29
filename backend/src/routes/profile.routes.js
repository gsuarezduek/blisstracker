const router = require('express').Router()
const { getProfile, updateProfile, changePassword } = require('../controllers/profile.controller')
const { auth } = require('../middleware/auth')

router.get('/',               auth, getProfile)
router.patch('/',             auth, updateProfile)
router.post('/change-password', auth, changePassword)

module.exports = router
