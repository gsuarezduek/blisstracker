const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

async function create(req, res, next) {
  try {
    const userId = req.user.id
    const { description, projectId } = req.body
    if (!description || !projectId) {
      return res.status(400).json({ error: 'Descripción y proyecto requeridos' })
    }

    // Ensure workday exists for today
    const date = todayString()
    let workDay = await prisma.workDay.findUnique({
      where: { userId_date: { userId, date } },
    })
    if (!workDay) {
      workDay = await prisma.workDay.create({ data: { userId, date } })
    }

    const task = await prisma.task.create({
      data: {
        description,
        projectId: Number(projectId),
        userId,
        workDayId: workDay.id,
      },
      include: { project: true },
    })
    res.status(201).json(task)
  } catch (err) { next(err) }
}

async function startTask(req, res, next) {
  try {
    const { id } = req.params
    const task = await prisma.task.update({
      where: { id: Number(id), userId: req.user.id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
      include: { project: true },
    })
    res.json(task)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tarea no encontrada' })
    next(err)
  }
}

async function completeTask(req, res, next) {
  try {
    const { id } = req.params
    const task = await prisma.task.update({
      where: { id: Number(id), userId: req.user.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { project: true },
    })
    res.json(task)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tarea no encontrada' })
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params
    await prisma.task.delete({
      where: { id: Number(id), userId: req.user.id },
    })
    res.json({ ok: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tarea no encontrada' })
    next(err)
  }
}

module.exports = { create, startTask, completeTask, remove }
