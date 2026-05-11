import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'

/* ── Icons ──────────────────────────────────────────────── */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

/* ── Constants ──────────────────────────────────────────── */
const CHANNELS = [
  { key: 'email',    label: 'Email',    sub: 'HTML email via Resend',   Icon: MailIcon,     colorKey: 'blue'  },
  { key: 'whatsapp', label: 'WhatsApp', sub: 'Meta Cloud API template', Icon: WhatsAppIcon, colorKey: 'green' },
  { key: 'push',     label: 'Push',     sub: 'Firebase FCM browser',    Icon: BellIcon,     colorKey: 'gold'  },
]

function initials(name = '') {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

/* ── Main component ─────────────────────────────────────── */
export default function NotificationDeliveryDemo() {
  const [message,      setMessage]      = useState('')
  const [channels,     setChannels]     = useState({ email: true, whatsapp: false, push: false })
  const [loading,      setLoading]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [error,        setError]        = useState('')

  // recipient mode: 'all' | 'select'
  const [mode,         setMode]         = useState('all')
  const [students,     setStudents]     = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [selectedIds,  setSelectedIds]  = useState(new Set())
  const [search,       setSearch]       = useState('')

  // fetch students once when switching to select mode
  useEffect(() => {
    if (mode === 'select' && students.length === 0) {
      setStudentsLoading(true)
      api.get('/admin/students')
        .then(res => setStudents(res.data?.students?.filter(s => s.status === 'Active') || []))
        .catch(() => setStudents([]))
        .finally(() => setStudentsLoading(false))
    }
  }, [mode])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || (s.enrollment || '').toLowerCase().includes(q)
    )
  }, [students, search])

  const toggleChannel = key => setChannels(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleStudent = id => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const selectAll  = () => setSelectedIds(new Set(filtered.map(s => s.id)))
  const deselectAll = () => setSelectedIds(new Set())
  const allFilteredSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s.id))

  const handleBroadcast = async () => {
    if (!message.trim())                                    { setError('Please enter a message.'); return }
    if (!channels.email && !channels.whatsapp && !channels.push) { setError('Select at least one delivery channel.'); return }
    if (mode === 'select' && selectedIds.size === 0)        { setError('Select at least one student.'); return }

    setError(''); setResult(null)
    try {
      setLoading(true)
      const res = await api.post('/admin/notifications/broadcast', {
        message:    message.trim(),
        email:      channels.email,
        whatsapp:   channels.whatsapp,
        push:       channels.push,
        studentIds: mode === 'select' ? [...selectedIds] : null,
      })
      setResult(res.data)
      setMessage('')
      if (mode === 'select') setSelectedIds(new Set())
    } catch (err) {
      setError(err.response?.data?.message || 'Broadcast failed.')
    } finally {
      setLoading(false)
    }
  }

  const activeChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k)
  const recipientLabel = mode === 'all'
    ? 'All active students'
    : selectedIds.size === 0 ? 'No students selected' : `${selectedIds.size} student${selectedIds.size !== 1 ? 's' : ''} selected`

  const canSend = !loading && activeChannels.length > 0 && message.trim() &&
    (mode === 'all' || selectedIds.size > 0)

  return (
    <div className="nd-wrap">
      <p className="nd-desc">
        Write a message, pick your recipients and channels. The{' '}
        <strong>Decorator Pattern</strong> builds the delivery chain at runtime —
        Base → Email? → WhatsApp? → Push? — and sends to your selected audience.
      </p>

      {/* ── Message ── */}
      <div className="nd-section">
        <div className="nd-section-label">
          <span className="nd-section-num">1</span>
          Message
        </div>
        <div className="nd-msg-group">
          <textarea
            className="nd-textarea"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Midterm exam schedule has been updated. Please check the portal."
            maxLength={300}
          />
          <span className="nd-char-count">{message.length}/300</span>
        </div>
      </div>

      {/* ── Recipients ── */}
      <div className="nd-section">
        <div className="nd-section-label">
          <span className="nd-section-num">2</span>
          Recipients
        </div>

        <div className="nd-mode-toggle">
          <button
            type="button"
            className={`nd-mode-btn${mode === 'all' ? ' nd-mode-active' : ''}`}
            onClick={() => setMode('all')}
          >
            <UsersIcon />
            All Students
          </button>
          <button
            type="button"
            className={`nd-mode-btn${mode === 'select' ? ' nd-mode-active' : ''}`}
            onClick={() => setMode('select')}
          >
            <TargetIcon />
            Select Students
          </button>
        </div>

        {mode === 'select' && (
          <div className="nd-picker">
            {/* Search + bulk actions */}
            <div className="nd-picker-toolbar">
              <div className="nd-search-wrap">
                <SearchIcon />
                <input
                  className="nd-search"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or enrollment…"
                />
              </div>
              <div className="nd-picker-actions">
                <button type="button" className="nd-bulk-btn" onClick={selectAll}>
                  Select all
                </button>
                <span className="nd-bulk-divider">·</span>
                <button type="button" className="nd-bulk-btn" onClick={deselectAll}>
                  Clear
                </button>
              </div>
            </div>

            {/* Student list */}
            <div className="nd-student-list">
              {studentsLoading ? (
                <div className="nd-list-empty">Loading students…</div>
              ) : filtered.length === 0 ? (
                <div className="nd-list-empty">
                  {search ? 'No students match your search.' : 'No active students found.'}
                </div>
              ) : filtered.map(s => {
                const checked = selectedIds.has(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`nd-student-item${checked ? ' nd-student-checked' : ''}`}
                    onClick={() => toggleStudent(s.id)}
                  >
                    <div className={`nd-student-avatar${checked ? ' nd-avatar-checked' : ''}`}>
                      {initials(s.name)}
                    </div>
                    <div className="nd-student-info">
                      <div className="nd-student-name">{s.name}</div>
                      {s.enrollment && (
                        <div className="nd-student-enroll">{s.enrollment}</div>
                      )}
                    </div>
                    <div className={`nd-student-check${checked ? ' nd-student-check-on' : ''}`}>
                      {checked && <CheckIcon />}
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedIds.size > 0 && (
              <div className="nd-selected-badge">
                <CheckIcon /> {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Channels ── */}
      <div className="nd-section">
        <div className="nd-section-label">
          <span className="nd-section-num">3</span>
          Delivery Channels
        </div>
        <div className="nd-channel-row">
          {CHANNELS.map(({ key, label, sub, Icon, colorKey }) => (
            <button
              key={key}
              type="button"
              className={`nd-channel nd-ch-${colorKey}${channels[key] ? ' nd-active' : ''}`}
              onClick={() => toggleChannel(key)}
            >
              <div className="nd-channel-icon"><Icon /></div>
              <div className="nd-channel-label">{label}</div>
              <div className="nd-channel-sub">{sub}</div>
              <div className={`nd-channel-check${channels[key] ? ' nd-checked' : ''}`}>
                {channels[key] ? <CheckIcon /> : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Send ── */}
      <div className="nd-send-row">
        <div className="nd-send-meta">
          <div className="nd-recipient-summary">
            <span className="nd-recipient-dot" />
            {recipientLabel}
          </div>
          {activeChannels.length > 0 && (
            <div className="nd-channel-summary">
              via {activeChannels.join(' · ')}
            </div>
          )}
        </div>
        <button
          className="btn-primary nd-send-btn"
          onClick={handleBroadcast}
          disabled={!canSend}
        >
          <SendIcon />
          {loading ? 'Sending…' : 'Send Broadcast'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error nd-feedback">
          <span>⚠</span> {error}
        </div>
      )}

      {result && (
        <div className="nd-result">
          <div className="nd-result-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="nd-result-title">{result.message}</div>
            <div className="nd-result-channels">
              {(result.channels || []).map(ch => (
                <span key={ch} className="nd-result-badge">{ch}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
