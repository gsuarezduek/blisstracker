import { useState, useRef, useEffect } from 'react'
import api from '../api/client'
import { linkify } from '../utils/linkify'

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
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const blockInputRef = useRef(null)

  useEffect(() => {
    if (showBlockForm) blockInputRef.current?.focus()
  }, [showBlockForm])

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
    setLoading(true)
    try {
      await api.delete(`/tasks/${task.id}`)
      onDelete(task.id)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  async function handleBlock() {
    if (!blockReason.trim()) return
    setLoading(true)
    try {
      const { data } = await api.patch(`/tasks/${task.id}/block`, { reason: blockReason.trim() })
      onUpdate(data)
      setShowBlockForm(false)
      setBlockReason('')
    } finally {
      setLoading(false)
    }
  }

  const statusDot = {
    PENDING:     'bg-gray-300',
    IN_PROGRESS: 'bg-blue-500 animate-pulse',
    PAUSED:      'bg-yellow-400',
    BLOCKED:     'bg-red-500',
    COMPLETED:   'bg-green-500',
  }

  const statusBadge = {
    PENDING:     'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    PAUSED:      'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
    BLOCKED:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    COMPLETED:   'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  }

  const statusLabel = {
    PENDING:     'Pendiente',
    IN_PROGRESS: 'En curso',
    PAUSED:      'Pausada',
    BLOCKED:     'Bloqueada',
    COMPLETED:   'Completada',
  }

  const canStart  = task.status === 'PENDING'  && !hasActiveTask
  const canResume = task.status === 'PAUSED'   && !hasActiveTask
  const isBlocked = task.status === 'BLOCKED'

  const borderClass = isBlocked
    ? 'border-red-300 dark:border-red-700'
    : 'dark:border-gray-700'

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${task.status === 'COMPLETED' ? 'opacity-70' : ''} ${borderClass}`}>

      {/* Delete button — top-right corner, only for PENDING tasks */}
      {task.status === 'PENDING' && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          title="Eliminar tarea"
          className="absolute -top-2.5 -right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-red-400 dark:hover:text-red-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors text-xs leading-none shadow-sm"
        >
          ×
        </button>
      )}

      {/* Main row */}
      <div className="flex items-start gap-4">
        {/* Status dot */}
        <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot[task.status]}`} />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-justify ${task.status === 'COMPLETED' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
            {linkify(task.description)}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded px-2 py-0.5">{task.project.name}</span>
            <span className={`text-xs rounded px-2 py-0.5 ${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>

            {task.status === 'IN_PROGRESS' && task.startedAt && (
              <span className="text-xs text-blue-500">⏱ {fmtMins(activeMinutes(task))}</span>
            )}
            {task.status === 'PAUSED' && (
              <span className="text-xs text-yellow-600">⏸ {fmtMins(activeMinutes(task))} trabajadas</span>
            )}
            {task.status === 'COMPLETED' && completedDuration(task) && (
              <span className="text-xs text-green-600">✓ {completedDuration(task)}</span>
            )}
            {task.createdBy && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Asignada por {task.createdBy.name.split(' ')[0]}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0 w-24">
          {task.status === 'PENDING' && (
            <button
              onClick={() => call('start')}
              disabled={loading || !canStart}
              title={hasActiveTask ? 'Pausá o completá la tarea en curso primero' : ''}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
                canStart
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Iniciar
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <>
              <button
                onClick={() => call('complete')}
                disabled={loading}
                className="w-full text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Completar
              </button>
              <button
                onClick={() => call('pause')}
                disabled={loading}
                className="w-full text-xs bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Pausar
              </button>
              <button
                onClick={() => { setShowBlockForm(v => !v); setBlockReason('') }}
                disabled={loading}
                className="w-full text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Bloquear
              </button>
            </>
          )}

          {task.status === 'PAUSED' && (
            <button
              onClick={() => call('resume')}
              disabled={loading || !canResume}
              title={hasActiveTask ? 'Pausá o completá la tarea en curso primero' : ''}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
                canResume
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuar
            </button>
          )}

          {isBlocked && (
            <button
              onClick={() => call('unblock')}
              disabled={loading}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Continuar
            </button>
          )}
        </div>
      </div>

      {/* Blocked reason display */}
      {isBlocked && task.blockedReason && (
        <div className="ml-6 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
          <span className="text-red-400 text-xs mt-0.5 flex-shrink-0">⚠</span>
          <p className="text-xs text-red-700 dark:text-red-400">{task.blockedReason}</p>
        </div>
      )}

      {/* Block form */}
      {showBlockForm && (
        <div className="ml-6 flex flex-col gap-2">
          <textarea
            ref={blockInputRef}
            rows={2}
            value={blockReason}
            onChange={e => setBlockReason(e.target.value)}
            placeholder="¿Por qué está bloqueada esta tarea?"
            className="w-full border border-red-300 dark:border-red-700 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleBlock}
              disabled={loading || !blockReason.trim()}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Confirmar bloqueo
            </button>
            <button
              onClick={() => { setShowBlockForm(false); setBlockReason('') }}
              className="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Eliminar tarea</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">"{task.description}"</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
