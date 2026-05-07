import { useState } from 'react'
import { useCreateGoal, useSubjects } from '../hooks/useStudyData'
import CustomSelect from './CustomSelect'
import './Forms.css'
import './CreateGoalForm.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']

const GOAL_TYPES = [
  {
    value: 'weekly',
    label: 'Weekly',
    desc: '7-day target',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    value: 'monthly',
    label: 'Monthly',
    desc: '30-day target',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4M16 2v4M3 10h18M3 6h18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
        <rect x="7" y="14" width="3" height="3" rx="0.5"/>
        <rect x="14" y="14" width="3" height="3" rx="0.5"/>
      </svg>
    ),
  },
]

export default function CreateGoalForm({ onSuccess, onCancel }) {
  const { createGoal, loading, error: hookError } = useCreateGoal()
  const { subjects, loading: subjectsLoading } = useSubjects()
  const studentId = localStorage.getItem('userId')

  const todayRaw = new Date(); todayRaw.setHours(0, 0, 0, 0)

  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    subjectId:   '',
    goalType:    'weekly',
    targetHours: 10,
    deadline:    '',
  })

  /* ── Inline calendar state ───────────────────────────── */
  const [calMonth, setCalMonth] = useState(todayRaw.getMonth())
  const [calYear,  setCalYear]  = useState(todayRaw.getFullYear())

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay    = new Date(calYear, calMonth, 1).getDay()

  // Max allowed deadline based on goal type
  const maxDate = new Date(todayRaw)
  maxDate.setDate(maxDate.getDate() + (form.goalType === 'weekly' ? 7 : 30))

  const isPast       = (d) => new Date(calYear, calMonth, d) <= todayRaw
  const isBeyondMax  = (d) => new Date(calYear, calMonth, d) > maxDate
  const isDisabled   = (d) => isPast(d) || isBeyondMax(d)
  const isToday      = (d) => new Date(calYear, calMonth, d).getTime() === todayRaw.getTime()
  const isSelected   = (d) => {
    if (!form.deadline) return false
    const sel = new Date(form.deadline); sel.setHours(0, 0, 0, 0)
    return new Date(calYear, calMonth, d).getTime() === sel.getTime()
  }

  // Block forward navigation once maxDate month is showing
  const atMaxMonth = calYear > maxDate.getFullYear() ||
    (calYear === maxDate.getFullYear() && calMonth >= maxDate.getMonth())

  const prevMonth = () => calMonth === 0  ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1)
  const nextMonth = () => {
    if (atMaxMonth) return
    calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1)
  }

  const pickDay = (d) => {
    if (isDisabled(d)) return
    const picked = new Date(calYear, calMonth, d, 23, 59, 0, 0)
    setForm(p => ({ ...p, deadline: picked.toISOString() }))
  }

  const selectedDisplay = form.deadline
    ? new Date(form.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : null

  /* ── Hours stepper ───────────────────────────────────── */
  const adjust = (delta) =>
    setForm(p => ({ ...p, targetHours: Math.max(1, Math.min(200, (p.targetHours || 0) + delta)) }))

  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!form.subjectId)  { setError('Please select a subject.'); return }
    if (!form.targetHours || form.targetHours < 1) { setError('Target hours must be at least 1.'); return }
    if (!form.deadline)   { setError('Please pick a deadline from the calendar.'); return }

    const deadlineDate = new Date(form.deadline)
    if (deadlineDate <= new Date()) { setError('Deadline must be in the future.'); return }

    const result = await createGoal({
      studentId:   parseInt(studentId),
      subjectId:   parseInt(form.subjectId),
      goalType:    form.goalType,
      targetHours: form.targetHours,
      deadline:    deadlineDate.toISOString(),
    })

    if (result.success) {
      setSuccess('Goal created!')
      setTimeout(() => onSuccess?.(), 1200)
    } else {
      setError(result.error || hookError || 'Failed to create goal.')
    }
  }

  return (
    <div className="form-modal-overlay">
      <div className="form-modal cg-modal">

        {/* ── Header ── */}
        <div className="cg-head">
          <div className="cg-head-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div>
            <div className="cg-head-title">New Study Goal</div>
            <div className="cg-head-sub">Set a target and stay on track</div>
          </div>
          <button className="form-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        {/* ── Alerts ── */}
        {(error || hookError) && (
          <div className="alert alert-error" style={{ margin: '12px 22px 0' }}>
            <span>⚠</span> {error || hookError}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ margin: '12px 22px 0' }}>
            <span>✓</span> {success}
          </div>
        )}

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} className="cg-body">

          {/* Subject */}
          <div className="cg-field">
            <label className="cg-label">Subject <span className="cg-req">*</span></label>
            <CustomSelect
              theme="green"
              options={subjects.map(s => ({ value: s.subjectId, label: s.name }))}
              value={form.subjectId}
              onChange={val => setForm(p => ({ ...p, subjectId: val }))}
              placeholder="Choose a subject"
              loading={subjectsLoading}
            />
          </div>

          {/* Goal type + Hours — side by side */}
          <div className="cg-row">
            <div className="cg-field">
              <label className="cg-label">Goal Type</label>
              <div className="cg-type-row">
                {GOAL_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`cg-type-card${form.goalType === t.value ? ' active' : ''}`}
                    onClick={() => setForm(p => {
                      const days = t.value === 'weekly' ? 7 : 30
                      const newMax = new Date(todayRaw); newMax.setDate(newMax.getDate() + days)
                      const deadline = p.deadline ? new Date(p.deadline) : null
                      return {
                        ...p,
                        goalType: t.value,
                        deadline: deadline && deadline > newMax ? '' : p.deadline,
                      }
                    })}
                  >
                    <span className="cg-type-ico">{t.icon}</span>
                    <span className="cg-type-lbl">{t.label}</span>
                    <span className="cg-type-desc">{t.desc}</span>
                    {form.goalType === t.value && (
                      <span className="cg-type-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                             strokeLinecap="round" strokeLinejoin="round" width="10" height="10">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="cg-field">
              <label className="cg-label">Target Hours <span className="cg-req">*</span></label>
              <div className="cg-stepper">
                <button type="button" className="cg-step-btn" onClick={() => adjust(-1)} disabled={form.targetHours <= 1}>−</button>
                <div className="cg-step-mid">
                  <input
                    type="number"
                    className="cg-step-input"
                    value={form.targetHours}
                    min="1" max="200"
                    onChange={e => setForm(p => ({ ...p, targetHours: parseInt(e.target.value) || 1 }))}
                  />
                  <span className="cg-step-unit">hrs</span>
                </div>
                <button type="button" className="cg-step-btn" onClick={() => adjust(1)} disabled={form.targetHours >= 200}>+</button>
              </div>
              <div className="cg-step-hint">
                {form.goalType === 'weekly'
                  ? `≈ ${(form.targetHours / 7).toFixed(1)} h/day`
                  : `≈ ${(form.targetHours / 30).toFixed(1)} h/day`}
              </div>
            </div>
          </div>

          {/* Deadline — inline calendar */}
          <div className="cg-field">
            <label className="cg-label">
              Deadline <span className="cg-req">*</span>
              {selectedDisplay && (
                <span className="cg-chosen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {selectedDisplay}
                </span>
              )}
            </label>

            <div className="cg-cal">
              {/* Month nav */}
              <div className="cg-cal-head">
                <button type="button" className="cg-cal-nav" onClick={prevMonth} aria-label="Previous month">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span className="cg-cal-my">{MONTHS[calMonth]} {calYear}</span>
                <button type="button" className="cg-cal-nav" onClick={nextMonth}
                        disabled={atMaxMonth} aria-label="Next month"
                        style={{ opacity: atMaxMonth ? 0.3 : 1 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              {/* Day grid */}
              <div className="cg-cal-grid">
                {DAY_HEADERS.map(h => (
                  <span key={h} className="cg-cal-dh">{h}</span>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                  <button
                    key={d}
                    type="button"
                    className={[
                      'cg-cal-day',
                      isPast(d)      ? 'cg-cal-past'     : '',
                      isBeyondMax(d) ? 'cg-cal-past'     : '',
                      isToday(d)     ? 'cg-cal-today'    : '',
                      isSelected(d)  ? 'cg-cal-selected' : '',
                    ].join(' ')}
                    onClick={() => pickDay(d)}
                    disabled={isDisabled(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="cg-cal-footer">
                {form.goalType === 'weekly' ? 'Weekly goal' : 'Monthly goal'} · deadline within{' '}
                <strong>{form.goalType === 'weekly' ? '7' : '30'} days</strong> · latest{' '}
                {maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="cg-actions">
            <button type="submit" className="btn-primary" disabled={loading || !!success}>
              {loading ? 'Creating…' : 'Create Goal'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  )
}
