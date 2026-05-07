import useTheme from '../hooks/useTheme'
import './ThemeToggle.css'

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="4.5"/>
    <line x1="12" y1="2"  x2="12" y2="4.5"/>
    <line x1="12" y1="19.5" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22"  x2="5.93" y2="5.93"/>
    <line x1="18.07" y1="18.07" x2="19.78" y2="19.78"/>
    <line x1="2"  y1="12" x2="4.5"  y2="12"/>
    <line x1="19.5" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.93" y2="18.07"/>
    <line x1="18.07" y1="5.93" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="17" height="17">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      className={`tt-btn${dark ? ' tt-dark' : ''}`}
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="tt-icon-wrap">
        <span className={`tt-icon tt-sun${!dark ? ' tt-active' : ''}`}>
          <SunIcon />
        </span>
        <span className={`tt-icon tt-moon${dark ? ' tt-active' : ''}`}>
          <MoonIcon />
        </span>
      </span>
    </button>
  )
}
