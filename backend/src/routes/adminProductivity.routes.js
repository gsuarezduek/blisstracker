const router = require('express').Router()
const { auth, adminOnly } = require('../middleware/auth')
const { listProductivity, refreshProductivity } = require('../controllers/adminProductivity.controller')

router.use(auth, adminOnly)
router.get('/',                      listProductivity)
router.post('/:userId/refresh',      refreshProductivity)

module.exports = router
