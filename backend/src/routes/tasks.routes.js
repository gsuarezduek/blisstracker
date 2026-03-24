const router = require('express').Router()
const { create, startTask, pauseTask, resumeTask, completeTask, remove } = require('../controllers/tasks.controller')
const { auth } = require('../middleware/auth')

router.use(auth)
router.post('/', create)
router.patch('/:id/start',    startTask)
router.patch('/:id/pause',    pauseTask)
router.patch('/:id/resume',   resumeTask)
router.patch('/:id/complete', completeTask)
router.delete('/:id', remove)

module.exports = router
