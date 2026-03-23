const router = require('express').Router()
const { list, create, update, remove } = require('../controllers/users.controller')
const { auth, adminOnly } = require('../middleware/auth')

router.use(auth, adminOnly)
router.get('/', list)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
