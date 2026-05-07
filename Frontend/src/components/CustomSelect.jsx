import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './CustomSelect.css'

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  loading = false,
  theme = 'green',    // 'green' | 'blue'
  icon,               // optional override; defaults to BookIcon
}) {
  const [open, setOpen]       = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, openUp: false })
  const triggerRef            = useRef(null)
  const listRef               = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  const openMenu = () => {
    if (disabled || loading) return
    const rect       = triggerRef.current.getBoundingClientRect()
    const listH      = Math.min(options.length * 42 + 12, 230)
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp     = spaceBelow < listH + 10 && rect.top > listH
    setDropPos({
      top:    openUp ? rect.top - listH - 6 : rect.bottom + 6,
      left:   rect.left,
      width:  rect.width,
      openUp,
    })
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const onDown   = (e) => {
      if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target))
        setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const displayIcon = icon !== undefined ? icon : <BookIcon />

  return (
    <div className={`cs-wrap cs-${theme}`} ref={triggerRef}>
      <button
        type="button"
        className={`cs-trigger${open ? ' cs-open' : ''}${!value ? ' cs-empty' : ''}`}
        onClick={openMenu}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {displayIcon && <span className="cs-icon">{displayIcon}</span>}
        <span className="cs-val">
          {loading ? 'Loading…' : (selected?.label || placeholder)}
        </span>
        <span className="cs-chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          role="listbox"
          className={`cs-list cs-${theme}${dropPos.openUp ? ' cs-up' : ''}`}
          style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width }}
        >
          {options.length === 0 ? (
            <div className="cs-empty-msg">No options available</div>
          ) : options.map(o => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={String(o.value) === String(value)}
              className={`cs-option${String(o.value) === String(value) ? ' cs-selected' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false) }}
            >
              <span>{o.label}</span>
              {String(o.value) === String(value) && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
