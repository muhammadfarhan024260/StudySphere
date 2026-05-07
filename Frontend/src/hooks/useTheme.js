import { useState, useEffect } from 'react'

const KEY   = 'ss-theme'
const EVENT = 'ss:theme'

export default function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem(KEY) === 'dark')

  // Stay in sync when another instance toggles
  useEffect(() => {
    const sync = () => setDark(localStorage.getItem(KEY) === 'dark')
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem(KEY, next ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    window.dispatchEvent(new Event(EVENT))
  }

  return { dark, toggle }
}
