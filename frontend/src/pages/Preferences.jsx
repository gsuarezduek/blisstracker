import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Preferences() {
  const { user, updateUser } = useAuth()
  const [weeklyEmail,  setWeeklyEmail]  = useState(true)
  const [dailyInsight, setDailyInsight] = useState(true)
  const [togglingW,    setTogglingW]    = useState(false)
  const [togglingD,    setTogglingD]    = useState(false)
  const [sending,      setSending]      = useState(false)
  const [sendMsg,      setSendMsg]      = useState({ text: '', error: false })
  const [loaded,         setLoaded]         = useState(false)
  const [globalSettings, setGlobalSettings] = useState(null)

  // Email sender config (derived from globalSettings.emailFrom)
  const [emailFromName,    setEmailFromName]    = useState('')
  const [emailFromAddress, setEmailFromAddress] = useState('')
  const [savingEmail,      setSavingEmail]      = useState(false)
  const [emailMsg,         setEmailMsg]         = useState({ text: '', error: false })
  const [sendingTest,      setSendingTest]      = useState(false)
  const [testMsg,          setTestMsg]          = useState({ text: '', error: false })
  const [showDns,          setShowDns]          = useState(false)

  const TIMEZONES = [
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
    { value: 'America/Sao_Paulo',              label: 'São Paulo (UTC-3)' },
    { value: 'America/Santiago',               label: 'Santiago (UTC-4/-3)' },
    { value: 'America/Bogota',                 label: 'Bogotá (UTC-5)' },
    { value: 'America/Lima',                   label: 'Lima (UTC-5)' },
    { value: 'America/Mexico_City',            label: 'Ciudad de México (UTC-6/-5)' },
    { value: 'America/New_York',               label: 'Nueva York (UTC-5/-4)' },
    { value: 'America/Los_Angeles',            label: 'Los Ángeles (UTC-8/-7)' },
    { value: 'Europe/Madrid',                  label: 'Madrid (UTC+1/+2)' },
    { value: 'Europe/London',                  label: 'Londres (UTC+0/+1)' },
    { value: 'UTC',                            label: 'UTC' },
  ]

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setWeeklyEmail(data.weeklyEmailEnabled   ?? true)
      setDailyInsight(data.dailyInsightEnabled ?? true)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!user?.isAdmin) return
    api.get('/projects/settings').then(({ data }) => {
      setGlobalSettings(data)
      // Parse emailFrom → name + address
      if (data.emailFrom) {
        const m = data.emailFrom.match(/^(.*?)\s*<([^>]+)>$/)
        if (m) {
          setEmailFromName(m[1].trim())
          setEmailFromAddress(m[2].trim())
        } else {
          setEmailFromName('')
          setEmailFromAddress(data.emailFrom.trim())
        }
      }
    })
  }, [user?.isAdmin])

  async function handleSaveEmailFrom() {
    if (!emailFromAddress.trim()) {
      setEmailMsg({ text: 'La dirección de email es requerida.', error: true })
      return
    }
    const combined = emailFromName.trim()
      ? `${emailFromName.trim()} <${emailFromAddress.trim()}>`
      : emailFromAddress.trim()
    setSavingEmail(true)
    setEmailMsg({ text: '', error: false })
    try {
      await api.patch('/projects/settings', { emailFrom: combined })
      setGlobalSettings(prev => ({ ...prev, emailFrom: combined }))
      setEmailMsg({ text: 'Remitente guardado correctamente.', error: false })
    } catch (err) {
      setEmailMsg({ text: err.response?.data?.error || 'Error al guardar.', error: true })
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleSendTestEmail() {
    setSendingTest(true)
    setTestMsg({ text: '', error: false })
    try {
      const { data } = await api.post('/projects/settings/test-email')
      setTestMsg({ text: `Email enviado a ${data.sentTo}. Revisá tu bandeja de entrada.`, error: false })
    } catch (err) {
      setTestMsg({ text: err.response?.data?.error || 'Error al enviar el email de prueba.', error: true })
    } finally {
      setSendingTest(false)
    }
  }

  async function handleGlobalSetting(patch) {
    setGlobalSettings(prev => ({ ...prev, ...patch }))
    try {
      await api.patch('/projects/settings', patch)
    } catch (_) {
      api.get('/projects/settings').then(({ data }) => setGlobalSettings(data))
    }
  }

  async function handleToggleWeekly() {
    const next = !weeklyEmail
    setTogglingW(true)
    try {
      await api.patch('/profile/preferences', { weeklyEmailEnabled: next })
      setWeeklyEmail(next)
    } catch (_) {}
    finally { setTogglingW(false) }
  }

  async function handleToggleInsight() {
    const next = !dailyInsight
    setTogglingD(true)
    try {
      // Al apagar el insight se apagan también los sub-features
      await api.patch('/profile/preferences', {
        dailyInsightEnabled:  next,
        insightMemoryEnabled: next,
        taskQualityEnabled:   next,
      })
      setDailyInsight(next)
      updateUser({ dailyInsightEnabled: next })
    } catch (_) {}
    finally { setTogglingD(false) }
  }

  async function handleSendNow() {
    setSending(true)
    setSendMsg({ text: '', error: false })
    try {
      await api.post('/profile/weekly-email/send')
      setSendMsg({ text: '¡Email enviado! Revisá tu bandeja de entrada.', error: false })
    } catch (err) {
      setSendMsg({ text: err.response?.data?.error || 'Error al enviar el email.', error: true })
    } finally {
      setSending(false)
    }
  }

  function Toggle({ on, onToggle, disabled }) {
    return (
      <button
        onClick={onToggle}
        disabled={disabled || !loaded}
        title={on ? 'Desactivar' : 'Activar'}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
          on ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preferencias</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configurá cómo querés usar BlissTracker.</p>
        </div>

        {/* Insight diario con IA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">

          {/* Toggle maestro */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Insight diario con IA</h2>
                <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full px-2 py-0.5 font-medium">IA</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Un coach de productividad personal basado en GTD que analiza tus tareas cada día y genera recomendaciones concretas y accionables.
              </p>
            </div>
            <Toggle on={dailyInsight} onToggle={handleToggleInsight} disabled={togglingD} />
          </div>

          {/* Sub-features — se dimean si el insight está apagado */}
          <div className={`space-y-0 border-t dark:border-gray-700 transition-opacity duration-200 ${dailyInsight ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

            {/* Memoria de aprendizaje */}
            <div className="flex items-start gap-3 py-4 border-b dark:border-gray-700">
              <div className="mt-0.5 flex-shrink-0 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Memoria de aprendizaje</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                  El sistema aprende de tus patrones semana a semana: cuándo tendés a bloquearte, en qué proyectos rendís mejor y qué días son más productivos. El insight evoluciona con vos.
                </p>
              </div>
            </div>

            {/* Coaching de calidad de tareas */}
            <div className={`flex items-start gap-3 py-4 ${user?.isAdmin ? 'border-b dark:border-gray-700' : ''}`}>
              <div className="mt-0.5 flex-shrink-0 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Coaching de calidad de tareas</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                  La IA detecta tareas con descripciones vagas y sugiere reformularlas como acciones concretas según GTD. "Trabajar en web" se convierte en "Enviar 3 opciones de homepage para aprobación".
                </p>
              </div>
            </div>

            {/* Conocimiento de roles (solo admins) */}
            {user?.isAdmin && (
              <div className="flex items-start gap-3 py-4">
                <div className="mt-0.5 flex-shrink-0 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Conocimiento de roles</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                    El insight detecta tareas recurrentes esperadas según el rol que no fueron registradas.
                  </p>
                </div>
                <Link
                  to="/admin?tab=role-ai"
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 transition-colors whitespace-nowrap"
                >
                  Configurar →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones y comunicación */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Notificaciones y comunicación</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Elegí qué comunicaciones querés recibir por email.</p>

          {/* Toggle resumen semanal */}
          <div className="flex items-start justify-between gap-4 py-4 border-b dark:border-gray-700">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Resumen semanal de productividad</span>
                <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full px-2 py-0.5 font-medium">IA</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Recibís un análisis de tu semana generado por inteligencia artificial cada <strong className="text-gray-600 dark:text-gray-300">viernes a las 14:00</strong>. Incluye tareas completadas, tiempo por proyecto, insights de productividad y recomendaciones accionables.
              </p>
            </div>
            <Toggle on={weeklyEmail} onToggle={handleToggleWeekly} disabled={togglingW} />
          </div>

          {/* Botón de prueba */}
          <div className="pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enviar resumen ahora</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Genera y envía el resumen de esta semana de forma inmediata.</p>
              </div>
              <button
                onClick={handleSendNow}
                disabled={sending}
                className="flex-shrink-0 flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 text-sm font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                    Enviar ahora
                  </>
                )}
              </button>
            </div>

            {sendMsg.text && (
              <p className={`mt-3 text-sm rounded-lg px-3 py-2 ${
                sendMsg.error
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              }`}>
                {sendMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Preferencias de Proyectos — solo admins */}
        {user?.isAdmin && globalSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Proyectos</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
              Configuración global compartida por todos los admins. Los cambios se aplican a todos los proyectos.
            </p>

            <div className="space-y-5">
              {/* Zona horaria */}
              <div className="flex items-start justify-between gap-4 py-4 border-b dark:border-gray-700">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Zona horaria</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Afecta cómo se muestran las fechas en la vista de cada proyecto.
                  </p>
                </div>
                <select
                  value={globalSettings.timezone || 'America/Argentina/Buenos_Aires'}
                  onChange={e => handleGlobalSetting({ timezone: e.target.value })}
                  className="text-xs border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 min-w-[190px]"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              {/* Links útiles */}
              <div className="flex items-start justify-between gap-4 py-4 border-b dark:border-gray-700">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Links útiles</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Muestra la sección de links en la vista de todos los proyectos.
                  </p>
                </div>
                <Toggle
                  on={globalSettings.linksEnabled !== false}
                  onToggle={() => handleGlobalSetting({ linksEnabled: !globalSettings.linksEnabled })}
                />
              </div>

              {/* Situación de la cuenta */}
              <div className="flex items-start justify-between gap-4 py-4 border-b dark:border-gray-700">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Situación de la cuenta</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Muestra el editor de situación en la vista de todos los proyectos.
                  </p>
                </div>
                <Toggle
                  on={globalSettings.situationEnabled !== false}
                  onToggle={() => handleGlobalSetting({ situationEnabled: !globalSettings.situationEnabled })}
                />
              </div>

              {/* Remitente de emails */}
              <div className="pt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-0.5">Remitente de emails</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nombre y dirección que aparece en los emails enviados por BlissTracker (resúmenes semanales, bienvenidas, recupero de contraseña).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={emailFromName}
                      onChange={e => setEmailFromName(e.target.value)}
                      placeholder="BlissTracker"
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={emailFromAddress}
                      onChange={e => setEmailFromAddress(e.target.value)}
                      placeholder="hola@tudominio.com"
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>

                {emailFromName || emailFromAddress ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Vista previa: <span className="font-mono text-gray-600 dark:text-gray-300">
                      {emailFromName.trim()
                        ? `${emailFromName.trim()} <${emailFromAddress.trim()}>`
                        : emailFromAddress.trim()}
                    </span>
                  </p>
                ) : null}

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleSaveEmailFrom}
                    disabled={savingEmail}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
                  >
                    {savingEmail ? 'Guardando...' : 'Guardar remitente'}
                  </button>
                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTest}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
                  >
                    {sendingTest ? 'Enviando...' : 'Enviar email de prueba'}
                  </button>
                </div>

                {emailMsg.text && (
                  <p className={`text-sm rounded-lg px-3 py-2 ${emailMsg.error ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                    {emailMsg.text}
                  </p>
                )}
                {testMsg.text && (
                  <p className={`text-sm rounded-lg px-3 py-2 ${testMsg.error ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                    {testMsg.text}
                  </p>
                )}

                {/* DNS instructions */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowDns(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ¿Cómo configurar el dominio en Resend?
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                      className={`w-4 h-4 text-gray-400 transition-transform ${showDns ? 'rotate-180' : ''}`}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {showDns && (
                    <div className="px-4 py-4 space-y-4 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                      <p>Para enviar emails desde tu propio dominio necesitás agregar estos registros DNS en tu proveedor (GoDaddy, Namecheap, Cloudflare, etc.) y verificar el dominio en <strong className="text-gray-700 dark:text-gray-300">resend.com/domains</strong>.</p>

                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">1. SPF — autoriza a Resend a enviar en tu nombre</p>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono space-y-1">
                            <p><span className="text-gray-400">Tipo:</span> <strong>TXT</strong></p>
                            <p><span className="text-gray-400">Host:</span> <strong>@</strong> (o tu dominio raíz)</p>
                            <p><span className="text-gray-400">Valor:</span> <strong>v=spf1 include:amazonses.com ~all</strong></p>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">2. DKIM — firma criptográfica de los emails</p>
                          <p className="mb-1">Resend genera 2 registros CNAME únicos para tu dominio. Los encontrás en <strong className="text-gray-700 dark:text-gray-300">resend.com/domains → tu dominio → DNS Records</strong>. Se ven así:</p>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono space-y-1">
                            <p><span className="text-gray-400">Tipo:</span> <strong>CNAME</strong></p>
                            <p><span className="text-gray-400">Host:</span> <strong>resend._domainkey.tudominio.com</strong></p>
                            <p><span className="text-gray-400">Valor:</span> <strong>p.resend.com</strong></p>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">3. DMARC — política de autenticación (recomendado)</p>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono space-y-1">
                            <p><span className="text-gray-400">Tipo:</span> <strong>TXT</strong></p>
                            <p><span className="text-gray-400">Host:</span> <strong>_dmarc</strong></p>
                            <p><span className="text-gray-400">Valor:</span> <strong>{'v=DMARC1; p=none;'}</strong></p>
                          </div>
                        </div>

                        <p className="text-gray-400 dark:text-gray-500">Los cambios DNS pueden tardar hasta 48h en propagarse. Una vez verificado el dominio en Resend, guardá el remitente y enviá un email de prueba.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
