import { useState } from 'react'
import api from '../api/client'

function duration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null
  const mins = Math.round((new Date(completedAt) - new Date(startedAt)) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function elapsed(startedAt) {
  if (!startedAt) return null
  const mins = Math.round((Date.now() - new Date(startedAt)) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    try {
      const { data } = await api.patch(`/tasks/${task.id}/start`)
      onUpdate(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const { data } = await api.patch(`/tasks/${task.id}/complete`)
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

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
  }
  const statusLabels = { PENDING: 'Pendiente', IN_PROGRESS: 'En curso', COMPLETED: 'Completada' }

  return (
    <div className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-opacity ${task.status === 'COMPLETED' ? 'opacity-70' : ''}`}>
      {/* Status indicator */}
      <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
        task.status === 'COMPLETED' ? 'bg-green-500' :
        task.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
      }`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.description}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{task.project.name}</span>
          <span className={`text-xs rounded px-2 py-0.5 ${statusColors[task.status]}`}>{statusLabels[task.status]}</span>
          {task.status === 'IN_PROGRESS' && task.startedAt && (
            <span className="text-xs text-blue-500">⏱ {elapsed(task.startedAt)}</span>
          )}
          {task.status === 'COMPLETED' && task.startedAt && task.completedAt && (
            <span className="text-xs text-green-600">✓ {duration(task.startedAt, task.completedAt)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {task.status === 'PENDING' && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Iniciar
          </button>
        )}
        {task.status === 'IN_PROGRESS' && (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Completar
          </button>
        )}
        {task.status === 'PENDING' && (
          <button onClick={handleDelete} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
        )}
      </div>
    </div>
  )
}
