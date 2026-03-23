const router = require('express').Router()
const { list, listAll, create, update } = require('../controllers/services.controller')
const { auth, adminOnly } = require('../middleware/auth')

router.get('/', auth, list)
router.get('/all', auth, adminOnly, listAll)
router.post('/', auth, adminOnly, create)
router.put('/:id', auth, adminOnly, update)

module.exports = router
