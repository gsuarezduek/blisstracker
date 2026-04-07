const prisma = require('../lib/prisma')
const { todayString } = require('../utils/dates')

async function snapshot(req, res, next) {
  try {
    const date = todayString()

    // Get all active users with their today workday and tasks
    const workDays = await prisma.workDay.findMany({
      where: { date },
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } },
        tasks: {
          include: { project: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

    const result = workDays.map(wd => {
      const inProgressTask = wd.tasks.find(t => t.status === 'IN_PROGRESS') ?? null
      const completedCount = wd.tasks.filter(t => t.status === 'COMPLETED').length
      const totalMins = wd.tasks
        .filter(t => t.status === 'COMPLETED' && t.startedAt && t.completedAt)
        .reduce((s, t) => s + Math.round((new Date(t.completedAt) - new Date(t.startedAt)) / 60000), 0)

      return {
        user: wd.user,
        workDay: {
          id: wd.id,
          startedAt: wd.startedAt,
          endedAt: wd.endedAt,
        },
        currentTask: inProgressTask,
        stats: {
          total: wd.tasks.length,
          completed: completedCount,
          pending: wd.tasks.filter(t => t.status === 'PENDING').length,
          blocked: wd.tasks.filter(t => t.status === 'BLOCKED').length,
          totalMinutes: totalMins,
        },
      }
    })

    // Usuarios con tarea en curso: los que empezaron más recientemente van primero
    // Usuarios sin tarea en curso: van después, ordenados por inicio del workday
    result.sort((a, b) => {
      const aTime = a.currentTask?.startedAt ? new Date(a.currentTask.startedAt).getTime() : null
      const bTime = b.currentTask?.startedAt ? new Date(b.currentTask.startedAt).getTime() : null
      if (aTime && bTime) return bTime - aTime           // ambos en curso: más reciente primero
      if (aTime) return -1                               // solo a en curso: a va primero
      if (bTime) return 1                                // solo b en curso: b va primero
      return new Date(a.workDay.startedAt) - new Date(b.workDay.startedAt) // ninguno: por llegada
    })

    const workedIds = new Set(workDays.map(wd => wd.userId))
    const allUsers = await prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, role: true, avatar: true },
      orderBy: { name: 'asc' },
    })
    const notStarted = allUsers.filter(u => !workedIds.has(u.id))

    res.json({ entries: result, notStarted })
  } catch (err) { next(err) }
}

module.exports = { snapshot }
