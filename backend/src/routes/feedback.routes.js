const router = require('express').Router()
const { create, list, markRead } = require('../controllers/feedback.controller')
const { auth, adminOnly } = require('../middleware/auth')

router.post('/', auth, create)                     // any logged user can send
router.get('/', auth, adminOnly, list)             // only admin can read all
router.put('/:id/read', auth, adminOnly, markRead) // mark as read

module.exports = router
