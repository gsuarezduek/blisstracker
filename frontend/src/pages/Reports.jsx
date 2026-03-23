import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/client'

function fmtMins(mins) {
  if (mins === 0) return '0m'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function thisWeekRange() {
  const now = new Date()
  const day = now.getDay() || 7
  const mon = new Date(now)
  mon.setDate(now.getDate() - day + 1)
  return {
    from: mon.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

export default function Reports() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [from, setFrom] = useState(thisWeekRange().from)
  const [to, setTo] = useState(thisWeekRange().to)
  const [expandedProject, setExpandedProject] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)

  async function loadReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      const { data: res } = await api.get(`/reports/by-project?${params}`)
      setData(res.sort((a, b) => b.totalMinutes - a.totalMinutes))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReport() }, [])

  const totalMins = data.reduce((s, d) => s + d.totalMinutes, 0)

  function toggleProject(id) {
    setExpandedProject(expandedProject === id ? null : id)
    setExpandedUser(null)
  }

  function toggleUser(key) {
    setExpandedUser(expandedUser === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportes</h1>

        {/* Filters */}
        <div className="flex gap-3 mb-6 items-end flex-wrap">
          <div>
            <label className="text-xs font-medium text-gray-600">Desde</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="mt-1 block border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Hasta</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="mt-1 block border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button onClick={loadReport} disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? 'Cargando...' : 'Ver reporte'}
          </button>
        </div>

        {/* Summary */}
        {data.length > 0 && (
          <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
            <span className="text-sm text-indigo-700 font-medium">Tiempo total registrado</span>
            <span className="text-xl font-bold text-indigo-700">{fmtMins(totalMins)}</span>
          </div>
        )}

        {/* Per project */}
        <div className="space-y-3">
          {data.map(d => (
            <div key={d.project.id} className="bg-white border rounded-xl overflow-hidden">
              {/* Project header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => toggleProject(d.project.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">{d.project.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">{d.taskCount} tareas</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary-600">{fmtMins(d.totalMinutes)}</span>
                  <span className="text-gray-400 text-sm">{expandedProject === d.project.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Progress bar */}
              <div className="px-4 pb-3">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full"
                    style={{ width: totalMins ? `${(d.totalMinutes / totalMins) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Breakdown by user */}
              {expandedProject === d.project.id && (
                <div className="border-t bg-gray-50">
                  {d.byUser.sort((a, b) => b.minutes - a.minutes).map(u => {
                    const userKey = `${d.project.id}-${u.user.id}`
                    return (
                      <div key={u.user.id} className="border-b last:border-b-0">
                        {/* User row */}
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors text-sm"
                          onClick={() => toggleUser(userKey)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{u.user.name}</span>
                            <span className="text-xs text-gray-400">{u.tasks} tarea{u.tasks !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{fmtMins(u.minutes)}</span>
                            <span className="text-gray-400 text-xs">{expandedUser === userKey ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {/* Task list for this user */}
                        {expandedUser === userKey && (
                          <div className="px-4 pb-3 space-y-1.5 bg-white">
                            {u.taskList.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt)).map(task => (
                              <div key={task.id} className="flex items-start justify-between text-sm py-1.5 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                  <span className="text-gray-700 truncate">{task.description}</span>
                                </div>
                                <span className="text-gray-500 flex-shrink-0 ml-3">{fmtMins(task.minutes)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {data.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">📊</p>
            <p>No hay datos para el período seleccionado</p>
          </div>
        )}
      </main>
    </div>
  )
}
