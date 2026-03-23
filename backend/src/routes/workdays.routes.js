const router = require('express').Router()
const { getOrCreateToday, finish } = require('../controllers/workdays.controller')
const { auth } = require('../middleware/auth')

router.get('/today', auth, getOrCreateToday)
router.post('/finish', auth, finish)

module.exports = router
