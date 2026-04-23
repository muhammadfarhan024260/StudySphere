import { useEffect, useState } from 'react'
import api from '../services/api'
import './Intelligence.css'

export default function StudentNotifications() {
  const studentId = localStorage.getItem('userId')
  const [notifications, setNotifications] = useState([])
  const [weakAreas, setWeakAreas] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    if (!studentId) {
      setError('No student ID — please log in.')
      setLoading(false)
      return
    }
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
    await api.put(`/intelligence/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n))
  }

  if (loading) return <div className="intel-panel">Loading…</div>
  if (error) return <div className="intel-panel intel-error">{error}</div>

  return (
    <div className="intel-panel">
      <section className="intel-section">
        <h3>Weak Subjects</h3>
        {weakAreas.length === 0
          ? <p className="intel-empty">No weak subjects detected. Keep it up.</p>
          : (
            <table className="intel-table">
              <thead><tr><th>Subject</th><th>Avg score</th><th>Detected</th></tr></thead>
              <tbody>
                {weakAreas.map(w => (
                  <tr key={w.subjectId}>
                    <td>{w.subjectName}</td>
                    <td>{Number(w.avgScore).toFixed(1)}</td>
                    <td>{new Date(w.detectedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>

      <section className="intel-section">
        <h3>Recommendations for you</h3>
        {recommendations.length === 0
          ? <p className="intel-empty">No recommendations match your weak areas right now.</p>
          : (
            <ul className="intel-reco-list">
              {recommendations.map(r => (
                <li key={r.recommendationId} className="intel-reco">
                  <div className="intel-reco-head">
                    <strong>{r.title}</strong>
                    <span className="intel-tag">{r.subjectName}</span>
                  </div>
                  <p>{r.content}</p>
                  <small>By {r.authoredBy}</small>
                </li>
              ))}
            </ul>
          )}
      </section>

      <section className="intel-section">
        <h3>Notifications</h3>
        {notifications.length === 0
          ? <p className="intel-empty">No notifications yet.</p>
          : (
            <ul className="intel-notif-list">
              {notifications.map(n => (
                <li key={n.notificationId} className={`intel-notif ${n.isRead ? 'read' : 'unread'}`}>
                  <div>
                    <span className="intel-notif-type">{n.type}</span>
                    <span className="intel-notif-msg">{n.message}</span>
                  </div>
                  <div className="intel-notif-meta">
                    <span>{new Date(n.createdDate).toLocaleString()}</span>
                    {!n.isRead && (
                      <button className="btn-small" onClick={() => markRead(n.notificationId)}>
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
      </section>
    </div>
  )
}
