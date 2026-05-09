import { useState } from 'react'
import { useLogSession, useSubjects } from '../hooks/useStudyData'
import CustomSelect from './CustomSelect'
import './Forms.css'
import './LogSessionForm.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']

const DURATION_PRESETS = [
  { label: '30m', value: 30  },
  { label: '45m', value: 45  },
  { label: '1h',  value: 60  },
  { label: '1.5h',value: 90  },
  { label: '2h',  value: 120 },
  { label: '3h',  value: 180 },
]

const PROD_LABELS = [
  '','Very Low','Low','Below Avg','Below Avg',
  'Average','Average','Good','Good','Excellent','Perfect',
]

const fmtDur = (mins) =>
  mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
    : `${mins}m`

export default function LogSessionForm({ onSuccess, onCancel }) {
  const { logSession, loading, error: hookError } = useLogSession()
  const { subjects, loading: subjectsLoading } = useSubjects()
  const studentId = localStorage.getItem('userId')

  const todayRaw = new Date(); todayRaw.setHours(0, 0, 0, 0)
  // Use noon local time so UTC conversion never crosses a date boundary
  const todayNoon = new Date(todayRaw.getFullYear(), todayRaw.getMonth(), todayRaw.getDate(), 12, 0, 0)

  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    subjectId:         '',
    durationMinutes:   60,
    productivityScore: 7,
    notes:             '',
    sessionDate:       todayNoon.toISOString(),
  })

  /* ── Calendar ────────────────────────────────────────── */
  const [calMonth, setCalMonth] = useState(todayRaw.getMonth())
  const [calYear,  setCalYear]  = useState(todayRaw.getFullYear())

  const daysInMonth   = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay      = new Date(calYear, calMonth, 1).getDay()
  const isFuture      = (d) => new Date(calYear, calMonth, d) > todayRaw
  const isToday       = (d) => new Date(calYear, calMonth, d).getTime() === todayRaw.getTime()
  const isSelectedCal = (d) => {
    if (!form.sessionDate) return false
    const sel = new Date(form.sessionDate); sel.setHours(0, 0, 0, 0)
    return new Date(calYear, calMonth, d).getTime() === sel.getTime()
  }

  const atCurrentMonth = calYear === todayRaw.getFullYear() && calMonth === todayRaw.getMonth()
  const prevMonth = () => calMonth === 0
    ? (setCalMonth(11), setCalYear(y => y - 1))
    : setCalMonth(m => m - 1)
  const nextMonth = () => {
    if (atCurrentMonth) return
    calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1)
  }
  const pickDay = (d) => {
    if (isFuture(d)) return
    setForm(p => ({ ...p, sessionDate: new Date(calYear, calMonth, d, 12, 0, 0).toISOString() }))
  }

  const selDateDisplay = (() => {
    const d = new Date(form.sessionDate)
    if (isNaN(d)) return 'Today'
    return d.toDateString() === todayRaw.toDateString()
      ? 'Today'
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  })()

  /* ── Steppers ────────────────────────────────────────── */
  const adjustDur  = (delta) => setForm(p => ({ ...p, durationMinutes:   Math.max(15,  Math.min(1440, p.durationMinutes   + delta)) }))
  const adjustProd = (delta) => setForm(p => ({ ...p, productivityScore: Math.max(1,   Math.min(10,   p.productivityScore + delta)) }))

  const prodColor = (s) => s >= 8 ? 'var(--orange)' : s >= 5 ? '#f59e0b' : 'var(--red)'

  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!form.subjectId)           { setError('Please select a subject.'); return }
    if (form.durationMinutes <= 0) { setError('Duration must be greater than 0 minutes.'); return }

    const result = await logSession({
      studentId:         parseInt(studentId),
      subjectId:         parseInt(form.subjectId),
      hoursStudied:      form.durationMinutes / 60,
      productivityScore: form.productivityScore,
      sessionDate:       (form.sessionDate ? new Date(form.sessionDate) : new Date()).toISOString(),
      notes:             form.notes,
    })

    if (result.success) {
      setSuccess('Session logged!')
      setTimeout(() => onSuccess?.(), 1400)
    } else {
      setError(result.error || hookError || 'Failed to log session.')
    }
  }

  return (
    <div className="form-modal-overlay">
      <div className="form-modal ls-modal">

        {/* ── Header ── */}
        <div className="ls-head">
          <div className="ls-head-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div className="ls-head-title">Log Study Session</div>
            <div className="ls-head-sub">Record what you studied today</div>
          </div>
          <button className="form-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        {/* ── Alerts ── */}
        {(error || hookError) && (
          <div className="alert alert-error" style={{ margin: '12px 20px 0' }}>
            <span>⚠</span> {error || hookError}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ margin: '12px 20px 0' }}>
            <span>✓</span> {success}
          </div>
        )}

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} className="ls-body">

          {/* Subject */}
          <div className="ls-field">
            <label className="ls-label">Subject <span className="ls-req">*</span></label>
            <CustomSelect
              theme="blue"
              options={subjects.map(s => ({ value: s.subjectId, label: s.name }))}
              value={form.subjectId}
              onChange={val => setForm(p => ({ ...p, subjectId: val }))}
              placeholder="Choose a subject"
              loading={subjectsLoading}
            />
          </div>

          {/* Duration + Productivity — 2-col row */}
          <div className="ls-row">

            {/* Duration */}
            <div className="ls-field">
              <label className="ls-label">Duration <span className="ls-req">*</span></label>
              <div className="ls-stepper ls-stepper--blue">
                <button type="button" className="ls-step-btn" onClick={() => adjustDur(-15)} disabled={form.durationMinutes <= 15}>−</button>
                <div className="ls-step-mid">
                  <span className="ls-step-val">{fmtDur(form.durationMinutes)}</span>
                </div>
                <button type="button" className="ls-step-btn" onClick={() => adjustDur(+15)} disabled={form.durationMinutes >= 1440}>+</button>
              </div>
              <div className="ls-chips">
                {DURATION_PRESETS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    className={`ls-chip${form.durationMinutes === p.value ? ' active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, durationMinutes: p.value }))}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Productivity */}
            <div className="ls-field">
              <label className="ls-label">
                Productivity
                <span className="ls-prod-badge" style={{ background: `${prodColor(form.productivityScore)}22`, color: prodColor(form.productivityScore) }}>
                  {PROD_LABELS[form.productivityScore]}
                </span>
              </label>
              <div className="ls-stepper ls-stepper--prod">
                <button type="button" className="ls-step-btn" onClick={() => adjustProd(-1)} disabled={form.productivityScore <= 1}>−</button>
                <div className="ls-step-mid">
                  <span className="ls-step-val" style={{ color: prodColor(form.productivityScore) }}>
                    {form.productivityScore}
                  </span>
                  <span className="ls-step-unit">/10</span>
                </div>
                <button type="button" className="ls-step-btn" onClick={() => adjustProd(+1)} disabled={form.productivityScore >= 10}>+</button>
              </div>
              <div className="ls-prod-track">
                <div
                  className="ls-prod-fill"
                  style={{ width: `${form.productivityScore * 10}%`, background: prodColor(form.productivityScore) }}
                />
              </div>
            </div>
          </div>

          {/* Session Date — inline calendar */}
          <div className="ls-field">
            <label className="ls-label">
              Session Date
              <span className="ls-date-chosen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {selDateDisplay}
              </span>
            </label>

            <div className="ls-cal">
              <div className="ls-cal-head">
                <button type="button" className="ls-cal-nav" onClick={prevMonth} aria-label="Previous month">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span className="ls-cal-my">{MONTHS[calMonth]} {calYear}</span>
                <button type="button" className="ls-cal-nav" onClick={nextMonth}
                        disabled={atCurrentMonth} aria-label="Next month"
                        style={{ opacity: atCurrentMonth ? 0.3 : 1 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              <div className="ls-cal-grid">
                {DAY_HEADERS.map(h => (
                  <span key={h} className="ls-cal-dh">{h}</span>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                  <button
                    key={d}
                    type="button"
                    className={[
                      'ls-cal-day',
                      isFuture(d)      ? 'ls-cal-future'   : '',
                      isToday(d)       ? 'ls-cal-today'    : '',
                      isSelectedCal(d) ? 'ls-cal-selected' : '',
                    ].join(' ')}
                    onClick={() => pickDay(d)}
                    disabled={isFuture(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="ls-cal-footer">
                Past and today are selectable · Future dates are disabled
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="ls-field">
            <label className="ls-label">Notes <span className="ls-opt">(optional)</span></label>
            <textarea
              className="ls-textarea"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="What did you focus on? Any challenges?"
              rows="2"
            />
          </div>

          {/* Actions */}
          <div className="ls-actions">
            <button type="submit" className="btn-primary" disabled={loading || !!success}>
              {loading ? 'Logging…' : 'Log Session'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  )
}
