import { useState, useEffect } from 'react'
import api from '../../api/client'

function ServiceCheckboxList({ allServices, selectedIds, onChange }) {
  if (allServices.length === 0) {
    return <p className="text-xs text-gray-400 mt-1">No hay servicios creados. Creá servicios en la pestaña Servicios.</p>
  }
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {allServices.filter(s => s.active).map(s => (
        <label key={s.id} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.includes(s.id)}
            onChange={() => {
              onChange(selectedIds.includes(s.id)
                ? selectedIds.filter(id => id !== s.id)
                : [...selectedIds, s.id])
            }}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-xs text-gray-700">{s.name}</span>
        </label>
      ))}
    </div>
  )
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState([])
  const [allServices, setAllServices] = useState([])
  const [name, setName] = useState('')
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editServiceIds, setEditServiceIds] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/projects/all'),
      api.get('/services/all'),
    ]).then(([proj, svc]) => {
      setProjects(proj.data)
      setAllServices(svc.data)
    })
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/projects', { name: name.trim(), serviceIds: selectedServiceIds })
      setProjects(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      setSelectedServiceIds([])
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

  function startEdit(project) {
    setEditingId(project.id)
    setEditName(project.name)
    setEditServiceIds(project.services.map(ps => ps.service.id))
  }

  async function handleSaveEdit(project) {
    try {
      const body = { serviceIds: editServiceIds }
      if (editName.trim() !== project.name) body.name = editName.trim()
      const { data } = await api.put(`/projects/${project.id}`, body)
      setProjects(prev => prev.map(p => p.id === data.id ? data : p).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar proyecto')
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Proyectos / Clientes</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <div className="flex gap-3">
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
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">Servicios asociados</p>
          <ServiceCheckboxList
            allServices={allServices}
            selectedIds={selectedServiceIds}
            onChange={setSelectedServiceIds}
          />
        </div>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Project list */}
      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="bg-white border rounded-xl overflow-hidden">
            {editingId === p.id ? (
              /* Edit mode */
              <div className="p-4 space-y-3">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-primary-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Servicios asociados</p>
                  <ServiceCheckboxList
                    allServices={allServices}
                    selectedIds={editServiceIds}
                    onChange={setEditServiceIds}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSaveEdit(p)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      Editar
                    </button>
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
                </div>
                {p.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-5">
                    {p.services.map(ps => (
                      <span key={ps.service.id} className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">
                        {ps.service.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
