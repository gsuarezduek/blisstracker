const prisma    = require('../lib/prisma')
const { generateMemoryForUser } = require('../services/insightMemory.service')

async function listProductivity(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true, name: true, role: true, avatar: true,
        insightMemories: {
          select: {
            tendencias: true, fortalezas: true, areasDeAtencion: true,
            estadisticas: true, weekStart: true, updatedAt: true,
          },
          orderBy: { weekStart: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    })

    // Normalizar: exponer el registro más reciente como `insightMemory` (o null)
    const result = users.map(u => ({
      ...u,
      insightMemory: u.insightMemories[0] ?? null,
      insightMemories: undefined,
    }))

    res.json(result)
  } catch (err) { next(err) }
}

async function refreshProductivity(req, res, next) {
  try {
    const userId = Number(req.params.userId)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, active: true } })
    if (!user || !user.active) return res.status(404).json({ error: 'Usuario no encontrado' })

    await generateMemoryForUser(userId)
    const memory = await prisma.userInsightMemory.findFirst({
      where: { userId },
      orderBy: { weekStart: 'desc' },
      select: {
        tendencias: true, fortalezas: true, areasDeAtencion: true,
        estadisticas: true, weekStart: true, updatedAt: true,
      },
    })
    res.json(memory)
  } catch (err) { next(err) }
}

module.exports = { listProductivity, refreshProductivity }
