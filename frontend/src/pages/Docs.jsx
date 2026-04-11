import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import useRoles from '../hooks/useRoles'

const TABS = [
  { id: 'filosofia', label: 'Filosofía' },
  { id: 'manual',    label: 'Manual de Uso' },
  { id: 'roles',     label: 'Roles' },
]

// ── Filosofía ──────────────────────────────────────────────────────────────

function FilosofiaTab() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Simplicidad + Foco Diario</h2>
        <p>En Bliss Team Tracker elegimos un enfoque simple: trabajar con claridad en el presente.</p>
        <p className="mt-2">En lugar de usar múltiples etiquetas, prioridades, fechas y configuraciones complejas, el sistema está diseñado para responder una sola pregunta:</p>
        <p className="mt-3 text-lg font-semibold text-primary-600 dark:text-primary-400">¿Qué es lo importante que tengo que hacer hoy?</p>
      </div>

      <Section title="Por qué no usamos prioridades">
        <p>En muchos sistemas, las tareas se clasifican como alta, media o baja prioridad. En la práctica, esto suele generar más confusión que claridad:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Todo termina siendo "alta prioridad"</li>
          <li>Las listas crecen sin control</li>
          <li>Se pierde el foco real</li>
        </ul>
        <p className="mt-3">En lugar de eso, promovemos una decisión consciente: <strong className="text-gray-900 dark:text-white">elegir pocas tareas importantes por día y ejecutarlas bien.</strong></p>
      </Section>

      <Section title="Por qué evitamos fechas y deadlines complejos">
        <p>Las fechas pueden ser útiles en algunos contextos, pero en el trabajo diario suelen generar:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Sobrecarga mental</li>
          <li>Planes que no se cumplen</li>
          <li>Sensación constante de atraso</li>
        </ul>
        <p className="mt-3">Nuestro enfoque es distinto: <strong className="text-gray-900 dark:text-white">trabajamos por día, no por acumulación futura.</strong></p>
        <p className="mt-2">Las tareas no desaparecen: se trasladan al día siguiente si no se completan (carry-over), manteniendo visibilidad sin generar presión artificial.</p>
      </Section>

      <Section title="Menos ruido, más acción">
        <p>Cada funcionalidad extra tiene un costo: más decisiones, más tiempo organizando en lugar de hacer, más fricción en el uso diario.</p>
        <p className="mt-2">Por eso elegimos un sistema donde:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Crear tareas es rápido</li>
          <li>Entender qué hacer es inmediato</li>
          <li>Ejecutar es lo principal</li>
        </ul>
      </Section>

      <Section title="Foco en ejecución, no en organización">
        <p>Muchos sistemas optimizan la planificación. Nosotros optimizamos la ejecución.</p>
        <p className="mt-2">Esto significa:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Menos tiempo gestionando tareas</li>
          <li>Más tiempo haciendo trabajo real</li>
          <li>Más claridad para todo el equipo</li>
        </ul>
      </Section>

      <Section title="Una forma de trabajo más humana">
        <p>El trabajo real no es lineal ni perfectamente planificable. Surgen imprevistos, cambios y nuevas prioridades todos los días.</p>
        <p className="mt-2">Este sistema se adapta a esa realidad:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Permite reorganizarse diariamente</li>
          <li>Reduce la frustración de planes que no se cumplen</li>
          <li>Hace visible el progreso real</li>
        </ul>
      </Section>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-5 text-center">
        <p className="text-base font-semibold text-gray-900 dark:text-white">No buscamos hacer más cosas.</p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">Buscamos hacer mejor las cosas importantes.</p>
        <p className="text-primary-600 dark:text-primary-400 font-medium mt-2">Y para eso, menos es más.</p>
      </div>
    </div>
  )
}

// ── Manual de Uso ──────────────────────────────────────────────────────────

function ManualTab() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manual de Uso</h2>
        <p className="text-gray-500 dark:text-gray-400">Trabajar con claridad, foco y ejecución.</p>
        <p className="mt-1 font-semibold text-gray-900 dark:text-white">BlissTracker no es para organizar tareas. Es para decidir qué hacer hoy y hacerlo bien.</p>
      </div>

      <Section title="Reglas básicas">
        <ol className="space-y-3 list-decimal list-inside">
          {[
            ['Todo está en BlissTracker', 'Nada queda en WhatsApp, cabeza o mails.'],
            ['Cada tarea debe ser clara', 'Tiene que ser una acción concreta.'],
            ['Solo 1 tarea en curso', 'No multitarea.'],
            ['Máximo 3 tareas destacadas', 'Son tu foco real del día.'],
            ['Si no es para hoy → Backlog', 'No sobrecargar el día.'],
            ['Si no podés avanzar → BLOCKED', 'No simular progreso.'],
          ].map(([rule, desc]) => (
            <li key={rule}>
              <strong className="text-gray-900 dark:text-white">{rule}</strong>
              <p className="ml-5 text-gray-500 dark:text-gray-400">{desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Cómo escribir una tarea">
        <p className="font-medium text-gray-900 dark:text-white">Tiene que poder ejecutarse sin pensar.</p>
        <div className="mt-3 space-y-1.5">
          {[
            ['❌', 'Ver campaña'],
            ['❌', 'Trabajar en web'],
            ['❌', 'Revisar cliente'],
            ['✅', 'Ajustar presupuesto campaña Meta cliente X'],
            ['✅', 'Diseñar 3 placas para Instagram cliente Y'],
            ['✅', 'Enviar propuesta por mail a cliente Z'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <span className={icon === '✅' ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}>{text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cómo organizar tu día">
        <p>Cada mañana:</p>
        <ol className="mt-2 space-y-1 list-decimal list-inside">
          <li>Revisar Dashboard</li>
          <li>Ver tareas pendientes</li>
          <li><strong className="text-gray-900 dark:text-white">Elegir 3 tareas clave (destacadas)</strong></li>
        </ol>
        <p className="mt-3 text-primary-600 dark:text-primary-400 font-medium">Si no definís tu foco, el día se desordena solo.</p>
      </Section>

      <Section title="Cómo trabajar">
        <ul className="space-y-1 list-disc list-inside">
          <li>Siempre 1 tarea activa</li>
          <li>No saltar entre tareas</li>
          <li>Completar antes de empezar otra</li>
        </ul>
        <p className="mt-3 font-medium text-gray-900 dark:text-white">Terminar cosas &gt; empezar muchas.</p>
      </Section>

      <Section title="Cuando aparece algo nuevo">
        <p className="font-semibold text-gray-900 dark:text-white">SIEMPRE:</p>
        <ol className="mt-2 space-y-1 list-decimal list-inside">
          <li>Crear tarea</li>
          <li>Definirla bien</li>
          <li>Decidir: ¿Hoy? → tareas del día / ¿Después? → backlog</li>
        </ol>
        <p className="mt-3 text-primary-600 dark:text-primary-400 font-medium">Nunca ejecutar directo sin registrar.</p>
      </Section>

      <Section title="Uso correcto de estados">
        <div className="space-y-2">
          {[
            ['PENDING',     'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',     'Pendiente — todavía no empezaste'],
            ['IN_PROGRESS', 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300', 'Estás trabajando ahora mismo'],
            ['PAUSED',      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',     'Pausa temporal — vas a retomarlo'],
            ['BLOCKED',     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',      'No podés avanzar — registrá el motivo'],
            ['COMPLETED',   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', 'Terminado'],
          ].map(([status, cls, desc]) => (
            <div key={status} className="flex items-center gap-3">
              <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${cls}`}>{status}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-amber-600 dark:text-amber-400 font-medium">No mentirse con los estados.</p>
      </Section>

      <Section title="Errores prohibidos">
        <ul className="space-y-1 list-disc list-inside text-red-600 dark:text-red-400">
          {[
            'Tareas vagas ("ver", "chequear", "trabajar en")',
            'Más de 10 tareas en el día',
            'Varias tareas en progreso',
            'No usar backlog',
            'No completar tareas',
            'No bloquear cuando corresponde',
          ].map(e => <li key={e}>{e}</li>)}
        </ul>
      </Section>

      <Section title="Uso del backlog">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
            <p className="font-semibold text-red-600 dark:text-red-400 mb-1">El backlog NO es</p>
            <ul className="space-y-0.5 text-red-500 dark:text-red-400">
              <li>❌ Acumulación de tareas</li>
              <li>❌ Cosas olvidadas</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3">
            <p className="font-semibold text-green-600 dark:text-green-400 mb-1">El backlog ES</p>
            <ul className="space-y-0.5 text-green-600 dark:text-green-400">
              <li>✅ Planificación futura</li>
              <li>✅ Lo que no es prioridad hoy</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Uso del insight (IA)">
        <ul className="space-y-1 list-disc list-inside">
          <li>Leerlo todos los días</li>
          <li>Aplicar al menos 1 sugerencia</li>
          <li>Prestar atención a tareas mal definidas, falta de foco y patrones repetidos</li>
        </ul>
        <p className="mt-3 text-amber-600 dark:text-amber-400 font-medium">Ignorarlo = perder valor del sistema.</p>
      </Section>

      <div className="bg-gray-900 dark:bg-gray-700 rounded-2xl p-5 text-center">
        <p className="text-white font-semibold text-base">Regla final</p>
        <p className="text-primary-400 font-medium mt-1">Si una tarea no está clara, no se va a hacer.</p>
      </div>
    </div>
  )
}

// ── Roles ──────────────────────────────────────────────────────────────────

const FREQ_GROUPS = {
  monday:     { label: 'Lunes',                icon: '📅', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
  daily:      { label: 'Lunes a viernes',      icon: '🔄', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
  friday:     { label: 'Viernes',              icon: '📅', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
  weekly:     { label: 'Semanal',              icon: '📆', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' },
  first_week: { label: 'Primera semana',       icon: '🗓️', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' },
  monthly:    { label: 'Mensual',              icon: '📊', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
}

function RolesTab() {
  const { user } = useAuth()
  const { labelFor } = useRoles()
  const [expectations, setExpectations] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/role-expectations/all').then(r => {
      setExpectations(r.data)
      const mine = r.data.find(e => e.roleName === user?.role)
      if (mine) setExpanded(mine.roleName)
      else if (r.data.length > 0) setExpanded(r.data[0].roleName)
    }).finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <div className="text-center py-16 text-gray-400 dark:text-gray-500">
      <p className="animate-pulse text-sm">Cargando roles...</p>
    </div>
  )

  if (expectations.length === 0) return (
    <div className="text-center py-16 text-gray-400 dark:text-gray-500">
      <p className="text-3xl mb-3">🎯</p>
      <p className="text-sm">No hay roles configurados todavía.</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {expectations.map(exp => {
        const isOpen  = expanded === exp.roleName
        const isMine  = exp.roleName === user?.role
        const label   = labelFor(exp.roleName)
        const results = Array.isArray(exp.expectedResults) ? exp.expectedResults : []
        const resps   = Array.isArray(exp.operationalResponsibilities) ? exp.operationalResponsibilities : []
        const tasks   = Array.isArray(exp.recurrentTasks) ? exp.recurrentTasks : []
        const hasContent = exp.description || results.length > 0 || resps.length > 0 || tasks.length > 0

        return (
          <div
            key={exp.roleName}
            className={`bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden transition-shadow ${
              isMine
                ? 'border-primary-300 dark:border-primary-700 shadow-md shadow-primary-100 dark:shadow-none ring-1 ring-primary-200 dark:ring-primary-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => setExpanded(isOpen ? null : exp.roleName)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar de rol */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold ${
                  isMine
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {label.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{label}</p>
                    {isMine && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full px-2.5 py-0.5 font-medium">
                        Tu rol
                      </span>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 pr-4">{exp.description}</p>
                  )}
                  {!exp.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sin descripción cargada</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                {/* Contadores en vista cerrada */}
                {!isOpen && hasContent && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    {results.length > 0 && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full px-2 py-0.5">{results.length} resultados</span>
                    )}
                    {tasks.length > 0 && (
                      <span className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full px-2 py-0.5">{tasks.length} tareas</span>
                    )}
                  </div>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Contenido expandido */}
            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-700">

                {!hasContent && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    Este rol todavía no tiene información cargada.
                  </p>
                )}

                {/* Propósito */}
                {exp.description && (
                  <div className="px-5 pt-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                      {exp.description}
                    </p>
                  </div>
                )}

                {/* Resultados esperados */}
                {results.length > 0 && (
                  <div className="px-5 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🎯</span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Resultados esperados</p>
                    </div>
                    <div className="space-y-2">
                      {results.map((r, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl px-3 py-2.5">
                          <span className="text-blue-400 dark:text-blue-500 flex-shrink-0 font-bold text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                          <p className="text-sm text-blue-900 dark:text-blue-200 leading-snug">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsabilidades operativas */}
                {resps.length > 0 && (
                  <div className="px-5 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">⚙️</span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Responsabilidades operativas</p>
                    </div>
                    <div className="space-y-3">
                      {resps.map((r, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">{r.category}</p>
                          {Array.isArray(r.items) && r.items.length > 0 && (
                            <ul className="space-y-1">
                              {r.items.map((item, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0 mt-2" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tareas recurrentes */}
                {tasks.length > 0 && (
                  <div className="px-5 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🔁</span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tareas recurrentes</p>
                    </div>
                    <div className="space-y-2">
                      {tasks.map((t, i) => {
                        const freq = FREQ_GROUPS[t.frequency] || { label: t.frequency, icon: '📌', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' }
                        return (
                          <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-3">
                            <span className={`text-xs font-medium rounded-lg px-2 py-1 flex-shrink-0 whitespace-nowrap ${freq.color}`}>
                              {freq.icon} {freq.label}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.task}</p>
                              {t.detail && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.detail}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="h-5" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {children}
    </div>
  )
}

const PILL_COLORS = {
  gray:   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  orange: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
}

function SectionPill({ color = 'gray', children }) {
  return (
    <span className={`inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-0.5 ${PILL_COLORS[color]}`}>
      {children}
    </span>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function Docs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.find(t => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'filosofia'

  function setTab(id) {
    setSearchParams({ tab: id })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Docs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Guías y referencias del equipo</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'filosofia' && <FilosofiaTab />}
        {tab === 'manual'    && <ManualTab />}
        {tab === 'roles'     && <RolesTab />}
      </div>
    </div>
  )
}
