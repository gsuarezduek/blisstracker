const app = require('./app')

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

const cron = require('node-cron')
const { sendAllWeeklyReports } = require('./services/weeklyReport.service')
const { updateAllMemories }    = require('./services/insightMemory.service')

// Cron: resumen semanal — viernes 14:00 hora Buenos Aires
cron.schedule('0 14 * * 5', async () => {
  console.log('[WeeklyReport] Iniciando envío automático (viernes 14:00 ART)...')
  await sendAllWeeklyReports()
}, { timezone: 'America/Argentina/Buenos_Aires' })

// Cron: actualizar memoria de insights — sábados 00:00 hora Buenos Aires
cron.schedule('0 0 * * 6', async () => {
  console.log('[InsightMemory] Iniciando actualización semanal (sábado 00:00 ART)...')
  await updateAllMemories()
}, { timezone: 'America/Argentina/Buenos_Aires' })

// Cron: auto-pausar tareas EN CURSO al final del día — medianoche hora Buenos Aires
cron.schedule('0 0 * * *', async () => {
  console.log('[AutoPause] Pausando tareas en curso al cierre del día...')
  const prisma = require('./lib/prisma')
  const { count } = await prisma.task.updateMany({
    where: { status: 'IN_PROGRESS' },
    data: { status: 'PAUSED', pausedAt: new Date() },
  })
  console.log(count > 0 ? `[AutoPause] ${count} tarea(s) pausada(s).` : '[AutoPause] Sin tareas activas.')
}, { timezone: 'America/Argentina/Buenos_Aires' })
