import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import AddTaskModal from '../components/AddTaskModal'
import InactivityModal from '../components/InactivityModal'
import { useInactivity } from '../hooks/useInactivity'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function todayLabel() {
  return new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [workDay, setWorkDay] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [elapsed, setElapsed] = useState('')

  const [carryOver, setCarryOver] = useState([])
  const [autoPausedTask, setAutoPausedTask] = useState(null)

  const loadToday = useCallback(async () => {
    const { data } = await api.get('/workdays/today')
    const { carryOverTasks, ...wd } = data
    setWorkDay(wd)
    setCarryOver(carryOverTasks ?? [])

    // Restore auto-paused modal if task was paused by inactivity detection
    const storedId = localStorage.getItem('autoPaused')
    if (storedId) {
      const taskId = Number(storedId)
      const allTasks = [...(wd.tasks ?? []), ...(carryOverTasks ?? [])]
      const task = allTasks.find(t => t.id === taskId && t.status === 'PAUSED')
      if (task) setAutoPausedTask(task)
      else localStorage.removeItem('autoPaused')
    }
  }, [])

  useEffect(() => { loadToday() }, [loadToday])

  // Live clock for workday elapsed time
  useEffect(() => {
    if (!workDay?.startedAt || workDay?.endedAt) return
    const update = () => {
      const mins = Math.round((Date.now() - new Date(workDay.startedAt)) / 60000)
      setElapsed(`${Math.floor(mins / 60)}h ${mins % 60}m`)
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [workDay])

  async function handleFinish() {
    if (!confirm('¿Finalizar jornada laboral? Se cerrará tu sesión automáticamente.')) return
    setFinishing(true)
    try {
      await api.post('/workdays/finish')
      logout()
      navigate('/login')
    } finally {
      setFinishing(false)
    }
  }

  function handleAddTask(task) {
    setWorkDay(prev => ({ ...prev, tasks: [...prev.tasks, task] }))
  }

  function handleUpdateTask(updated) {
    // Si la tarea estaba en carryOver y se completó, sacarla de ahí
    if (carryOver.find(t => t.id === updated.id)) {
      if (updated.status === 'COMPLETED') {
        setCarryOver(prev => prev.filter(t => t.id !== updated.id))
      } else {
        setCarryOver(prev => prev.map(t => t.id === updated.id ? updated : t))
      }
      return
    }
    setWorkDay(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updated.id ? updated : t),
    }))
  }

  function handleDeleteTask(id) {
    if (carryOver.find(t => t.id === id)) {
      setCarryOver(prev => prev.filter(t => t.id !== id))
      return
    }
    setWorkDay(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
  }

  const tasks = workDay?.tasks ?? []
  const activeTask = tasks.find(t => t.status === 'IN_PROGRESS')
    ?? carryOver.find(t => t.status === 'IN_PROGRESS')
    ?? null

  // Inactivity detection for the active task
  async function handleAutoPause() {
    const task = activeTask
    if (!task) return
    try {
      const { data } = await api.patch(`/tasks/${task.id}/pause`)
      handleUpdateTask(data)
      localStorage.setItem('autoPaused', String(task.id))
      setAutoPausedTask(data)
    } catch (_) {}
  }

  const { dismiss } = useInactivity({
    activeTask,
    onAutoPause: handleAutoPause,
  })

  function clearAutoPaused() {
    localStorage.removeItem('autoPaused')
    setAutoPausedTask(null)
    dismiss()
  }

  async function handleResumeAutoPaused() {
    if (!autoPausedTask) return
    try {
      const { data } = await api.patch(`/tasks/${autoPausedTask.id}/resume`)
      handleUpdateTask(data)
    } catch (_) {}
    clearAutoPaused()
  }

  // Tareas destacadas: de hoy + carryOver, no completadas, no en curso, con estrella, ordenadas por nivel desc
  const starred = [...tasks, ...carryOver]
    .filter(t => (t.starred ?? 0) > 0 && t.status !== 'COMPLETED' && t.status !== 'IN_PROGRESS')
    .sort((a, b) => (b.starred ?? 0) - (a.starred ?? 0))
  const starredIds = new Set(starred.map(t => t.id))

  // En curso incluye todas (starred o no). Las starred no-en-curso van solo a su sección.
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS')
  const pending    = tasks.filter(t => t.status === 'PENDING'  && !starredIds.has(t.id))
  const paused     = tasks.filter(t => t.status === 'PAUSED'   && !starredIds.has(t.id))
  const blocked    = tasks.filter(t => t.status === 'BLOCKED'  && !starredIds.has(t.id))
  const completed  = tasks.filter(t => t.status === 'COMPLETED')
  const hasActiveTask = tasks.some(t => t.status === 'IN_PROGRESS') || carryOver.some(t => t.status === 'IN_PROGRESS')

  const totalMins = completed.reduce((acc, t) => {
    if (!t.startedAt || !t.completedAt) return acc
    return acc + Math.max(0, Math.round((new Date(t.completedAt) - new Date(t.startedAt)) / 60000) - (t.pausedMinutes || 0))
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buen día, {user?.name.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 capitalize">{todayLabel()}</p>
          </div>
          <div className="text-right">
            {workDay && !workDay.endedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Jornada: <span className="font-medium text-gray-700 dark:text-gray-300">{elapsed}</span></p>
            )}
            {workDay?.endedAt && (
              <p className="text-sm text-green-600 font-medium">Jornada finalizada ✓</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{tasks.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total tareas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completed.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completadas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {totalMins >= 60 ? `${Math.floor(totalMins/60)}h ${totalMins%60}m` : `${totalMins}m`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tiempo registrado</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {!workDay?.endedAt && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl py-3 transition-colors"
            >
              + Agregar tarea
            </button>
          )}
          {!workDay?.endedAt && tasks.length > 0 && (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl px-5 py-3 transition-colors disabled:opacity-50"
            >
              {finishing ? 'Finalizando...' : 'Finalizar jornada'}
            </button>
          )}
        </div>

        {/* 1. En curso */}
        {inProgress.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">En curso</h2>
            <div className="space-y-2">
              {inProgress.map(t => (
                <TaskCard key={t.id} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {/* 2. Destacadas (starred no-en-curso) */}
        {starred.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Destacadas</h2>
            <div className="space-y-2">
              {starred.map(t => (
                <TaskCard key={`starred-${t.id}`} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Carry-over de días anteriores (no starred) */}
        {carryOver.some(t => !starredIds.has(t.id)) && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>⏳</span> Pendientes de días anteriores
            </h2>
            <div className="space-y-2">
              {carryOver.filter(t => !starredIds.has(t.id)).map(t => (
                <TaskCard key={t.id} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Pausadas */}
        {paused.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Pausadas</h2>
            <div className="space-y-2">
              {paused.map(t => (
                <TaskCard key={t.id} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Bloqueadas */}
        {blocked.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span>⚠</span> Bloqueadas
            </h2>
            <div className="space-y-2">
              {blocked.map(t => (
                <TaskCard key={t.id} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Pendientes */}
        {pending.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Pendientes</h2>
            <div className="space-y-2">
              {pending.map(t => (
                <TaskCard key={t.id} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Completadas</h2>
            <div className="space-y-2">
              {completed.map(t => (
                <TaskCard key={t.id} task={t} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} hasActiveTask={hasActiveTask} />
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No hay tareas por hoy</p>
            <p className="text-sm mt-1">Agregá tu primera tarea para empezar</p>
          </div>
        )}
      </main>

      {showModal && <AddTaskModal onAdd={handleAddTask} onClose={() => setShowModal(false)} />}

      <InactivityModal
        phase={autoPausedTask ? 'auto_paused' : null}
        taskDescription={autoPausedTask?.description}
        onDismiss={clearAutoPaused}
        onResume={handleResumeAutoPaused}
      />
    </div>
  )
}
