import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function ProjectsTab() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/projects/all').then(r => setProjects(r.data))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/projects', { name: name.trim() })
      setProjects(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear proyecto')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(project) {
    const { data } = await api.put(`/projects/${project.id}`, { active: !project.active })
    setProjects(prev => prev.map(p => p.id === data.id ? data : p))
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Proyectos / Clientes</h2>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre del proyecto o cliente"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Agregar'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
            </div>
            <button
              onClick={() => toggleActive(p)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                p.active
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {p.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
