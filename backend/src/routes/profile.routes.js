const router = require('express').Router()
const { getProfile, updateProfile, changePassword, updateAvatar, updatePreferences, sendTestWeeklyEmail } = require('../controllers/profile.controller')
const { auth } = require('../middleware/auth')

router.get('/',                auth, getProfile)
router.patch('/',              auth, updateProfile)
router.patch('/avatar',        auth, updateAvatar)
router.patch('/preferences',       auth, updatePreferences)
router.post('/weekly-email/send',  auth, sendTestWeeklyEmail)
router.post('/change-password',    auth, changePassword)

module.exports = router
