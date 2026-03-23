const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function create(req, res, next) {
  try {
    const { type, message } = req.body
    if (!type || !message?.trim()) {
      return res.status(400).json({ error: 'Tipo y mensaje requeridos' })
    }
    if (!['SUGGESTION', 'BUG'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido' })
    }
    const feedback = await prisma.feedback.create({
      data: { userId: req.user.id, type, message: message.trim() },
      include: { user: { select: { id: true, name: true, role: true } } },
    })
    res.status(201).json(feedback)
  } catch (err) { next(err) }
}

async function list(req, res, next) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(feedbacks)
  } catch (err) { next(err) }
}

async function markRead(req, res, next) {
  try {
    const feedback = await prisma.feedback.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    })
    res.json(feedback)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'No encontrado' })
    next(err)
  }
}

module.exports = { create, list, markRead }
