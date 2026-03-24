import { useState } from 'react'
import api from '../api/client'

// Active minutes worked, excluding paused time
function activeMinutes(task) {
  if (!task.startedAt) return 0
  const base = task.status === 'PAUSED' && task.pausedAt
    ? new Date(task.pausedAt) - new Date(task.startedAt)
    : Date.now()            - new Date(task.startedAt)
  return Math.max(0, Math.round(base / 60000) - (task.pausedMinutes || 0))
}

function fmtMins(mins) {
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function completedDuration(task) {
  if (!task.startedAt || !task.completedAt) return null
  const mins = Math.max(0, Math.round((new Date(task.completedAt) - new Date(task.startedAt)) / 60000) - (task.pausedMinutes || 0))
  return fmtMins(mins)
}

export default function TaskCard({ task, onUpdate, onDelete, hasActiveTask }) {
  const [loading, setLoading] = useState(false)

  async function call(endpoint) {
    setLoading(true)
    try {
      const { data } = await api.patch(`/tasks/${task.id}/${endpoint}`)
      onUpdate(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar tarea?')) return
    await api.delete(`/tasks/${task.id}`)
    onDelete(task.id)
  }

  const statusDot = {
    PENDING:     'bg-gray-300',
    IN_PROGRESS: 'bg-blue-500 animate-pulse',
    PAUSED:      'bg-yellow-400',
    COMPLETED:   'bg-green-500',
  }

  const statusBadge = {
    PENDING:     'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    PAUSED:      'bg-yellow-100 text-yellow-700',
    COMPLETED:   'bg-green-100 text-green-700',
  }

  const statusLabel = {
    PENDING:     'Pendiente',
    IN_PROGRESS: 'En curso',
    PAUSED:      'Pausada',
    COMPLETED:   'Completada',
  }

  const canStart  = task.status === 'PENDING'  && !hasActiveTask
  const canResume = task.status === 'PAUSED'   && !hasActiveTask

  return (
    <div className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-opacity ${task.status === 'COMPLETED' ? 'opacity-70' : ''}`}>
      {/* Status dot */}
      <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot[task.status]}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.description}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{task.project.name}</span>
          <span className={`text-xs rounded px-2 py-0.5 ${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>

          {/* Live elapsed for in-progress */}
          {task.status === 'IN_PROGRESS' && task.startedAt && (
            <span className="text-xs text-blue-500">⏱ {fmtMins(activeMinutes(task))}</span>
          )}

          {/* Accumulated time for paused */}
          {task.status === 'PAUSED' && (
            <span className="text-xs text-yellow-600">⏸ {fmtMins(activeMinutes(task))} trabajadas</span>
          )}

          {/* Final duration for completed */}
          {task.status === 'COMPLETED' && completedDuration(task) && (
            <span className="text-xs text-green-600">✓ {completedDuration(task)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* PENDING: Iniciar (disabled if another task is active) */}
        {task.status === 'PENDING' && (
          <>
            <button
              onClick={() => call('start')}
              disabled={loading || !canStart}
              title={hasActiveTask ? 'Pausá o completá la tarea en curso primero' : ''}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
                canStart
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Iniciar
            </button>
            <button onClick={handleDelete} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </>
        )}

        {/* IN_PROGRESS: Pausar + Completar */}
        {task.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => call('pause')}
              disabled={loading}
              className="text-xs bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Pausar
            </button>
            <button
              onClick={() => call('complete')}
              disabled={loading}
              className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Completar
            </button>
          </>
        )}

        {/* PAUSED: Continuar (disabled if another task is active) */}
        {task.status === 'PAUSED' && (
          <button
            onClick={() => call('resume')}
            disabled={loading || !canResume}
            title={hasActiveTask ? 'Pausá o completá la tarea en curso primero' : ''}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
              canResume
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  )
}
