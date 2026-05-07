import { useState, useRef, useEffect } from 'react'
import './DatePicker.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function DatePicker({ value, onChange, placeholder = 'Pick a date' }) {
  const todayRaw = new Date()
  todayRaw.setHours(0, 0, 0, 0)

  const selected = value ? (() => { const d = new Date(value); d.setHours(0,0,0,0); return d })() : null

  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(selected?.getMonth() ?? todayRaw.getMonth())
  const [year,  setYear]  = useState(selected?.getFullYear() ?? todayRaw.getFullYear())

  const wrapRef = useRef(null)

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1)

  const isPast     = (d) => new Date(year, month, d) <= todayRaw
  const isToday    = (d) => new Date(year, month, d).getTime() === todayRaw.getTime()
  const isSelected = (d) => selected && new Date(year, month, d).getTime() === selected.getTime()

  const pickDay = (d) => {
    if (isPast(d)) return
    const picked = new Date(year, month, d, 23, 59, 0, 0)
    onChange(picked.toISOString())
    setOpen(false)
  }

  const display = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <div className="dp-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dp-trigger${open ? ' dp-open' : ''}${!display ? ' dp-empty' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="dp-cal-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        <span className="dp-val">{display || placeholder}</span>
        <svg className="dp-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="dp-cal">
          {/* Month / Year header */}
          <div className="dp-cal-head">
            <button type="button" className="dp-nav-btn" onClick={prevMonth} aria-label="Previous month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span className="dp-my">{MONTHS[month]} {year}</span>
            <button type="button" className="dp-nav-btn" onClick={nextMonth} aria-label="Next month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Day grid */}
          <div className="dp-grid">
            {DAY_HEADERS.map(h => (
              <span key={h} className="dp-dh">{h}</span>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`b${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <button
                key={d}
                type="button"
                className={[
                  'dp-day',
                  isPast(d)     ? 'dp-past'     : '',
                  isToday(d)    ? 'dp-today'    : '',
                  isSelected(d) ? 'dp-selected' : '',
                ].join(' ')}
                onClick={() => pickDay(d)}
                disabled={isPast(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="dp-footer">
            <span>Only future dates are selectable</span>
          </div>
        </div>
      )}
    </div>
  )
}
