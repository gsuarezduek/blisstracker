import { useState, useEffect, useRef } from 'react'

const INACTIVITY_WARN_MS = 60 * 60 * 1000  // 60 minutes
const AUTO_PAUSE_SECS    = 10 * 60          // 10 minutes countdown

function sendChromeNotification(taskDescription) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification('¿Seguís trabajando?', {
      body: `Llevas más de 60 minutos en "${taskDescription}" sin actividad.`,
      icon: '/favicon.ico',
      tag: 'inactivity-check',
      requireInteraction: true,
    })
  } catch (_) {}
}

export function useInactivity({ activeTask, onAutoPause }) {
  const [showWarning, setShowWarning]   = useState(false)
  const [secondsLeft, setSecondsLeft]   = useState(AUTO_PAUSE_SECS)
  const lastActivityRef   = useRef(Date.now())
  const showWarningRef    = useRef(false)
  const onAutoPauseRef    = useRef(onAutoPause)
  const autoPauseFiredRef = useRef(false)

  useEffect(() => { showWarningRef.current = showWarning }, [showWarning])
  useEffect(() => { onAutoPauseRef.current = onAutoPause }, [onAutoPause])

  // Request Chrome notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Reset timer when active task changes
  useEffect(() => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)
    autoPauseFiredRef.current = false
  }, [activeTask?.id])

  // Track user interactions (paused while warning is visible)
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    const handler = () => {
      if (!showWarningRef.current) lastActivityRef.current = Date.now()
    }
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    return () => events.forEach(e => window.removeEventListener(e, handler))
  }, [])

  // Inactivity watcher — polls every 30s
  useEffect(() => {
    if (!activeTask) return
    const t = setInterval(() => {
      if (showWarningRef.current) return
      if (Date.now() - lastActivityRef.current >= INACTIVITY_WARN_MS) {
        setShowWarning(true)
        setSecondsLeft(AUTO_PAUSE_SECS)
        autoPauseFiredRef.current = false
        sendChromeNotification(activeTask.description)
      }
    }, 30_000)
    return () => clearInterval(t)
  }, [activeTask])

  // Countdown while warning is visible
  useEffect(() => {
    if (!showWarning) return
    const t = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(t); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [showWarning])

  // Trigger auto-pause once when countdown hits 0
  useEffect(() => {
    if (showWarning && secondsLeft === 0 && !autoPauseFiredRef.current) {
      autoPauseFiredRef.current = true
      onAutoPauseRef.current?.()
    }
  }, [showWarning, secondsLeft])

  function dismiss() {
    setShowWarning(false)
    lastActivityRef.current = Date.now()
    autoPauseFiredRef.current = false
  }

  return { showWarning, secondsLeft, dismiss }
}
