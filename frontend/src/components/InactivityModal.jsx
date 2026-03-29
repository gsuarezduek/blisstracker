export default function InactivityModal({
  phase,           // 'warning' | 'auto_paused'
  secondsLeft,     // for warning countdown
  taskDescription,
  onDismiss,       // "Continuar trabajando" / "Cerrar"
  onPause,         // "Pausar tarea" (from warning)
  onResume,        // "Reanudar tarea" (from auto_paused)
  onComplete,      // "Marcar como completada" (from auto_paused)
}) {
  if (!phase) return null

  const mins = Math.floor(secondsLeft / 60)
  const secs = String(secondsLeft % 60).padStart(2, '0')

  if (phase === 'warning') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-3">⏰</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              ¿Seguís trabajando en esta tarea?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Llevas más de 60 minutos sin actividad en:
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
              "{taskDescription}"
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center mb-5">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Se pausará automáticamente en
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              {mins}:{secs}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onDismiss}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              Continuar trabajando
            </button>
            <button
              onClick={onPause}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-xl py-3 transition-colors"
            >
              Pausar tarea
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'auto_paused') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-3">⏸️</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Tarea pausada por inactividad
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              La tarea fue pausada automáticamente. ¿Querés retomarla o marcarla como completada?
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
              "{taskDescription}"
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onResume}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              Reanudar tarea
            </button>
            <button
              onClick={onComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              Marcar como completada
            </button>
            <button
              onClick={onDismiss}
              className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm py-2 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
