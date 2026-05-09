import { useEffect, useState } from 'react'
import api from '../services/api'
import ConfirmationModal from './ConfirmationModal'
import './StudentNotifications.css'

/* ── Relative time ─────────────────────────────────── */
function relativeTime(dateStr) {
  const utc = typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') ? dateStr + 'Z' : dateStr
  const diff = Date.now() - new Date(utc).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return new Date(dateStr).toLocaleDateString()
}

/* ── Score color ──────────────────────────────────── */
const scoreVariant = s => s >= 7 ? 'good' : s >= 4 ? 'mid' : 'bad'

/* ── Icons ────────────────────────────────────────── */
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const MegaphoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/>
    <line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const InboxEmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const typeConfig = {
  broadcast:      { Icon: MegaphoneIcon, label: 'Broadcast', variant: 'blue' },
  system:         { Icon: MegaphoneIcon, label: 'Broadcast', variant: 'blue' },
  weak_area:      { Icon: AlertIcon,     label: 'Alert',     variant: 'red'  },
  recommendation: { Icon: BulbIcon,      label: 'Tip',       variant: 'gold' },
}
const getType = t => typeConfig[t?.toLowerCase()] || { Icon: BellIcon, label: t || 'Notice', variant: 'purple' }

export default function StudentNotifications() {
  const studentId = localStorage.getItem('userId')
  const [notifications,   setNotifications]   = useState([])
  const [weakAreas,       setWeakAreas]        = useState([])
  const [recommendations, setRecommendations]  = useState([])
  const [loading,         setLoading]          = useState(true)
  const [error,           setError]            = useState('')
  const [clearModal,      setClearModal]       = useState(false)
  const [markingId,       setMarkingId]        = useState(null)

  const load = async () => {
    if (!studentId) { setError('No student ID — please log in.'); setLoading(false); return }
    setLoading(true)
    try {
      const [n, w, r] = await Promise.all([
        api.get(`/intelligence/student/${studentId}/notifications`),
        api.get(`/intelligence/student/${studentId}/weak-subjects`),
        api.get(`/intelligence/student/${studentId}/recommendations`),
      ])
      setNotifications(n.data)
      setWeakAreas(w.data)
      setRecommendations(r.data)
      setError('')
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    setMarkingId(id)
    try {
      await api.put(`/intelligence/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n))
    } finally {
      setMarkingId(null)
    }
  }

  const confirmClear = async () => {
    try {
      await api.delete(`/intelligence/student/${studentId}/notifications`)
      setNotifications([])
      setClearModal(false)
    } catch (e) {
      console.error('Failed to clear notifications', e)
    }
  }

  if (loading) return (
    <div className="sn-loading">
      <div className="sn-spinner" />
      <span>Loading your inbox…</span>
    </div>
  )
  if (error) return <div className="sn-error">{error}</div>

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="sn-page">

      {/* ── Weak Subjects ───────────────────────────── */}
      <div className="sn-card">
        <div className="sn-card-header">
          <div className="sn-card-title">
            <span className="sn-card-icon sn-icon--red"><AlertIcon /></span>
            <span>Weak Subjects</span>
          </div>
          {weakAreas.length > 0 && (
            <span className="sn-badge sn-badge--red">{weakAreas.length} flagged</span>
          )}
        </div>
        <div className="sn-card-body">
          {weakAreas.length === 0 ? (
            <div className="sn-empty">
              <StarIcon />
              <p>No weak areas detected — great work!</p>
            </div>
          ) : (
            <div className="sn-weak-list">
              {weakAreas.map(w => {
                const score = Number(w.avgScore)
                const v = scoreVariant(score)
                return (
                  <div key={w.subjectId} className="sn-weak-row">
                    <div className="sn-weak-name">
                      <span className="sn-weak-dot" data-variant={v} />
                      {w.subjectName}
                    </div>
                    <div className="sn-weak-right">
                      <span className={`sn-score sn-score--${v}`}>
                        {score.toFixed(1)} / 10
                      </span>
                      <span className="sn-weak-date">{relativeTime(w.detectedDate)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recommendations ─────────────────────────── */}
      <div className="sn-card">
        <div className="sn-card-header">
          <div className="sn-card-title">
            <span className="sn-card-icon sn-icon--gold"><BulbIcon /></span>
            <span>Recommendations</span>
          </div>
          {recommendations.length > 0 && (
            <span className="sn-badge sn-badge--gold">{recommendations.length} for you</span>
          )}
        </div>
        <div className="sn-card-body">
          {recommendations.length === 0 ? (
            <div className="sn-empty">
              <BulbIcon />
              <p>No recommendations match your profile yet.</p>
            </div>
          ) : (
            <div className="sn-reco-list">
              {recommendations.map(r => (
                <div key={r.recommendationId} className="sn-reco">
                  <div className="sn-reco-accent" />
                  <div className="sn-reco-body">
                    <div className="sn-reco-top">
                      <span className="sn-reco-title">{r.title}</span>
                      <span className="sn-reco-subject">{r.subjectName}</span>
                    </div>
                    <p className="sn-reco-content">{r.content}</p>
                    <span className="sn-reco-author">By {r.authoredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Notifications inbox ─────────────────────── */}
      <div className="sn-card">
        <div className="sn-card-header">
          <div className="sn-card-title">
            <span className="sn-card-icon sn-icon--blue"><BellIcon /></span>
            <span>Notifications</span>
            {unread > 0 && <span className="sn-unread-pill">{unread} new</span>}
          </div>
          {notifications.length > 0 && (
            <button className="sn-clear-btn" onClick={() => setClearModal(true)}>
              Clear all
            </button>
          )}
        </div>
        <div className="sn-card-body sn-card-body--flush">
          {notifications.length === 0 ? (
            <div className="sn-empty">
              <InboxEmptyIcon />
              <p>Your inbox is empty.</p>
            </div>
          ) : (
            <ul className="sn-inbox">
              {notifications.map(n => {
                const { Icon, label, variant } = getType(n.type)
                return (
                  <li key={n.notificationId}
                      className={`sn-notif ${n.isRead ? 'sn-notif--read' : 'sn-notif--unread'}`}>
                    <span className={`sn-notif-icon sn-notif-icon--${variant}`}>
                      <Icon />
                    </span>
                    <div className="sn-notif-body">
                      <div className="sn-notif-top">
                        <span className={`sn-notif-type sn-notif-type--${variant}`}>{label}</span>
                        <span className="sn-notif-time">{relativeTime(n.createdDate)}</span>
                      </div>
                      <p className="sn-notif-msg">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        className={`sn-mark-btn${markingId === n.notificationId ? ' sn-mark-btn--loading' : ''}`}
                        onClick={() => markRead(n.notificationId)}
                        title="Mark as read"
                        disabled={markingId === n.notificationId}
                      >
                        <CheckIcon />
                      </button>
                    )}
                    {n.isRead && <span className="sn-read-dot" title="Read" />}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={clearModal}
        title="Clear all notifications"
        message="This will permanently delete all your notifications. This can't be undone."
        onConfirm={confirmClear}
        onCancel={() => setClearModal(false)}
        confirmText="Clear all"
        danger={true}
      />
    </div>
  )
}
