export function fmtMins(mins) {
  if (!mins || mins === 0) return '0m'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

// Active minutes worked on a task, excluding paused time
export function activeMinutes(task) {
  if (!task.startedAt) return 0
  const base = task.status === 'PAUSED' && task.pausedAt
    ? new Date(task.pausedAt) - new Date(task.startedAt)
    : Date.now()              - new Date(task.startedAt)
  return Math.max(0, Math.round(base / 60000) - (task.pausedMinutes || 0))
}

// Duration of a completed task as formatted string, or null
export function completedDuration(task) {
  if (!task.startedAt || !task.completedAt) return null
  const mins = Math.max(0, Math.round((new Date(task.completedAt) - new Date(task.startedAt)) / 60000) - (task.pausedMinutes || 0))
  return fmtMins(mins)
}
