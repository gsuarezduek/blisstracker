const prisma    = require('../lib/prisma')
const { generateMemoryForUser } = require('../services/insightMemory.service')

async function listProductivity(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true, name: true, role: true, avatar: true,
        insightMemory: {
          select: {
            tendencias: true, fortalezas: true, areasDeAtencion: true,
            estadisticas: true, weekStart: true, updatedAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    res.json(users)
  } catch (err) { next(err) }
}

async function refreshProductivity(req, res, next) {
  try {
    const userId = Number(req.params.userId)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, active: true } })
    if (!user || !user.active) return res.status(404).json({ error: 'Usuario no encontrado' })

    const memory = await generateMemoryForUser(userId)
    res.json(memory)
  } catch (err) { next(err) }
}

module.exports = { listProductivity, refreshProductivity }
