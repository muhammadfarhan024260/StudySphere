import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import StudentNotifications from './StudentNotifications'
import LogSessionForm from './LogSessionForm'
import CreateGoalForm from './CreateGoalForm'
import { useStudyLogs, useGoals, useWeakAreas, useSubjects, useWeeklyReport, useStudyScope, useDeleteGoal } from '../hooks/useStudyData'
import api from '../services/api'
import './Dashboard.css'
import './StudentDashboard.css'

async function registerFcmToken() {
  const userId = localStorage.getItem('userId')
  const flagKey = `fcmTokenRegistered_${userId}`
  if (localStorage.getItem(flagKey)) return
  try {
    const { messaging, getToken } = await import('../services/firebase')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
    })
    if (token) {
      await api.put('/student/fcm-token', { fcmToken: token })
      localStorage.setItem(flagKey, '1')
    }
  } catch (err) {
    console.warn('[FCM] Token registration skipped:', err.message)
  }
}

const AlertTriangle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const calcGoalPct = (goal, logs) => {
  if (!goal.subjectId || !goal.targetHours) return 0
  const logged = logs
    .filter(l => l.subjectId === goal.subjectId)
    .reduce((sum, l) => sum + (l.hoursStudied || 0), 0)
  return Math.min(Math.round((logged / goal.targetHours) * 100), 100)
}

// Override backend status with client-computed progress so completed goals show correctly
const getEffectiveStatus = (goal, logs) => {
  if (goal.status === 'Completed') return 'Completed'
  const pct = calcGoalPct(goal, logs)
  if (pct >= 100) return 'Completed'
  if (pct > 0 || goal.status === 'In Progress') return 'In Progress'
  return 'Not Started'
}

const goalStatusClass = (status) =>
  status === 'Completed'  ? 'status-active'      :
  status === 'In Progress'? 'status-in-progress'  : 'status-inactive'

const prodClass = (score) =>
  score >= 8 ? 'prod-high' : score >= 5 ? 'prod-mid' : 'prod-low'

const calcStreak = (logs) => {
  if (!logs.length) return 0
  const days = new Set(
    logs
      .filter(l => l.dateLogged)
      .map(l => { const d = new Date(l.dateLogged); d.setHours(0,0,0,0); return d.getTime() })
  )
  const today = new Date(); today.setHours(0,0,0,0)
  let check = new Date(today)
  // allow streak to count from yesterday if nothing logged today yet
  if (!days.has(check.getTime())) check.setDate(check.getDate() - 1)
  let streak = 0
  while (days.has(check.getTime())) {
    streak++
    check.setDate(check.getDate() - 1)
  }
  return streak
}

// Safe date formatter — treats all backend dates as UTC (Npgsql omits Z suffix)
const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const utc = typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')
    ? dateStr + 'Z'
    : dateStr
  const d = new Date(utc)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

export default function StudentDashboard() {
  const studentId = localStorage.getItem('userId')

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const { logs, loading: logsLoading, refetch: refetchLogs } = useStudyLogs(studentId)
  const { goals, loading: goalsLoading, refetch: refetchGoals } = useGoals(studentId)
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { weakAreas, refetch: refetchWeakAreas } = useWeakAreas(studentId)
  const { report: weeklyReport, loading: reportLoading } = useWeeklyReport(studentId)
  const { scope: studyScope, loading: scopeLoading } = useStudyScope(studentId)
  const { deleteGoal } = useDeleteGoal()

  const [deletingGoalId, setDeletingGoalId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null) // { id, title }

  const [weeklyTarget, setWeeklyTarget] = useState(() => parseInt(localStorage.getItem('weeklyGoalHours') || '20'))
  const [editingTarget, setEditingTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')

  useEffect(() => { registerFcmToken() }, [])

  const handleDeleteGoal = (goalId, goalTitle) => {
    setConfirmDialog({ id: goalId, title: goalTitle || `Goal #${goalId}` })
  }

  const doDeleteGoal = async () => {
    if (!confirmDialog) return
    const { id } = confirmDialog
    setConfirmDialog(null)
    setDeletingGoalId(id)
    const result = await deleteGoal(id)
    setDeletingGoalId(null)
    if (result.success) refetchGoals()
  }

  const saveWeeklyTarget = () => {
    const val = parseInt(targetInput)
    if (val > 0 && val <= 168) {
      setWeeklyTarget(val)
      localStorage.setItem('weeklyGoalHours', String(val))
    }
    setEditingTarget(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await api.delete('/auth/account')
      localStorage.clear()
      window.location.href = '/'
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account. Please try again.')
      setDeleteLoading(false)
    }
  }

  const [studentData, setStudentData] = useState({
    name:             localStorage.getItem('userName')       || '',
    enrollmentNumber: localStorage.getItem('userEnrollment') || '',
    email:            localStorage.getItem('userEmail')      || '',
    phone:            localStorage.getItem('userPhone')      || '',
    semester:         localStorage.getItem('userSemester')   || '',
    department:       localStorage.getItem('userDepartment') || '',
  })

  const [editData, setEditData] = useState(studentData)

  const calcStats = () => {
    const totalHours = logs.reduce((s, l) => s + (l.hoursStudied || 0), 0)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const thisWeekHours = logs
      .filter(l => l.dateLogged && new Date(l.dateLogged) >= weekStart)
      .reduce((s, l) => s + (l.hoursStudied || 0), 0)
    const lastWeekHours = logs
      .filter(l => l.dateLogged && new Date(l.dateLogged) >= lastWeekStart && new Date(l.dateLogged) < weekStart)
      .reduce((s, l) => s + (l.hoursStudied || 0), 0)
    const avgProd = logs.length
      ? (logs.reduce((s, l) => s + l.productivityScore, 0) / logs.length).toFixed(1)
      : '—'
    return {
      totalHours:     totalHours.toFixed(1),
      thisWeekHours:  thisWeekHours.toFixed(1),
      lastWeekHours:  lastWeekHours.toFixed(1),
      completedGoals: goals.filter(g => getEffectiveStatus(g, logs) === 'Completed').length,
      totalGoals:     goals.length,
      avgProd,
    }
  }

  const st = calcStats()

  const weekPct = weeklyTarget > 0 ? parseFloat(st.thisWeekHours) / weeklyTarget : 0
  const thisWeekChange  = weekPct >= 0.8 ? 'On track' : weekPct >= 0.4 ? 'In progress' : 'Behind'
  const thisWeekVariant = weekPct >= 0.8 ? 'stat-change--blue' : weekPct >= 0.4 ? 'stat-change--gold' : 'stat-change--red'

  const weekDiff = parseFloat(st.thisWeekHours) - parseFloat(st.lastWeekHours)
  const totalHoursChange = weekDiff > 0
    ? `+${weekDiff.toFixed(1)}h vs last week`
    : weekDiff < 0
    ? `${weekDiff.toFixed(1)}h vs last week`
    : 'Same as last week'

  const streak = calcStreak(logs)
  const streakLabel = streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '—'

  const statCards = [
    { label: 'Total Hours',  value: `${st.totalHours}h`,                     change: totalHoursChange, variant: weekDiff >= 0 ? '' : 'stat-change--red' },
    { label: 'This Week',    value: `${st.thisWeekHours}h`,                  change: thisWeekChange,   variant: thisWeekVariant },
    { label: 'Study Streak', value: streakLabel,                             change: streak > 0 ? 'Keep it up!' : 'Start today', variant: streak >= 3 ? 'stat-change--gold' : '' },
    { label: 'Goals Done',   value: `${st.completedGoals}/${st.totalGoals}`, change: 'Completed',      variant: 'stat-change--purple' },
  ]

  const handleSessionLogged = () => { setShowSessionForm(false); refetchLogs(); refetchWeakAreas() }
  const handleGoalCreated   = () => { setShowGoalForm(false);    refetchGoals() }

  const handleProfileSave = () => {
    localStorage.setItem('userName',       editData.name)
    localStorage.setItem('userPhone',      editData.phone)
    localStorage.setItem('userSemester',   editData.semester)
    localStorage.setItem('userDepartment', editData.department)
    setStudentData(editData)
    setIsEditingProfile(false)
    setProfileSuccess('Profile updated successfully.')
    setTimeout(() => setProfileSuccess(''), 4000)
  }

  /* ─── OVERVIEW ─── */
  const renderOverview = () => {
    // Subject distribution from all logs
    const subjectHoursMap = {}
    logs.forEach(l => {
      const name = l.subjectName || 'Unknown'
      subjectHoursMap[name] = (subjectHoursMap[name] || 0) + (l.hoursStudied || 0)
    })
    const subjectData = Object.entries(subjectHoursMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
    const maxSubjH = subjectData.length > 0 ? Math.max(...subjectData.map(([,h]) => h)) : 1

    // Last 7 days activity
    const todayMid = new Date(); todayMid.setHours(0,0,0,0)
    const DAY_LABELS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const dayActivity = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(todayMid); day.setDate(day.getDate() - (6 - i))
      const next = new Date(day); next.setDate(next.getDate() + 1)
      const hours = logs.filter(l => {
        if (!l.dateLogged) return false
        const ld = new Date(l.dateLogged); ld.setHours(0,0,0,0)
        return ld >= day && ld < next
      }).reduce((s, l) => s + (l.hoursStudied || 0), 0)
      return { label: DAY_LABELS_SHORT[day.getDay()], hours: Math.round(hours * 10) / 10, isToday: day.getTime() === todayMid.getTime() }
    })
    const maxDayH = Math.max(...dayActivity.map(d => d.hours), 0.1)

    return (
      <div className="tab-content">
        <div className="stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="stat-box">
              <div className="stat-header">
                <span className="stat-label">{s.label}</span>
                <span className={`stat-change ${s.variant}`}>{s.change}</span>
              </div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Weekly progress — editable target */}
        <div className="card wide">
          <div className="card-header">
            <h3>Weekly Progress</h3>
            <span className="sd-week-target-label">
              Target: {editingTarget ? (
                <span className="sd-target-edit-wrap">
                  <input
                    type="number"
                    className="sd-target-input"
                    value={targetInput}
                    min="1" max="168"
                    onChange={e => setTargetInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveWeeklyTarget(); if (e.key === 'Escape') setEditingTarget(false) }}
                    autoFocus
                  />
                  <button className="sd-target-btn sd-target-save" onClick={saveWeeklyTarget}>✓</button>
                  <button className="sd-target-btn sd-target-cancel" onClick={() => setEditingTarget(false)}>✕</button>
                </span>
              ) : (
                <span className="sd-target-display">
                  {weeklyTarget}h
                  <button className="sd-target-edit-btn" onClick={() => { setTargetInput(String(weeklyTarget)); setEditingTarget(true) }} title="Edit weekly target">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </span>
              )}
            </span>
          </div>
          <div className="card-body">
            <div className="progress-section">
              <div className="progress-info">
                <span className="progress-label">Hours This Week</span>
                <span className="progress-value">{st.thisWeekHours} / {weeklyTarget}h</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill"
                    style={{ width: `${Math.min((parseFloat(st.thisWeekHours) / weeklyTarget) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="progress-detail">
                {Math.round((parseFloat(st.thisWeekHours) / weeklyTarget) * 100)}% of weekly target
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          {/* Subject distribution */}
          <div className="card">
            <div className="card-header"><h3>Study by Subject</h3></div>
            <div className="card-body">
              {logsLoading ? <p className="sd-loading-text">Loading…</p> :
               subjectData.length === 0 ? (
                 <div className="sd-empty"><p>No sessions yet.</p></div>
               ) : (
                 <div className="sd-subj-list">
                   {subjectData.map(([name, hours]) => (
                     <div key={name} className="sd-subj-row">
                       <span className="sd-subj-name" title={name}>{name}</span>
                       <div className="sd-subj-track">
                         <div className="sd-subj-fill" style={{ width: `${(hours / maxSubjH) * 100}%` }} />
                       </div>
                       <span className="sd-subj-hrs">{hours.toFixed(1)}h</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          {/* 7-day activity */}
          <div className="card">
            <div className="card-header"><h3>Last 7 Days</h3></div>
            <div className="card-body">
              {logsLoading ? <p className="sd-loading-text">Loading…</p> : (
                <div className="sd-activity-wrap">
                  <div className="sd-activity">
                    {dayActivity.map((d, i) => (
                      <div key={i} className="sd-act-day">
                        <span className="sd-act-hrs">{d.hours > 0 ? `${d.hours}h` : ''}</span>
                        <div className="sd-act-bar-wrap">
                          <div
                            className={`sd-act-bar${d.isToday ? ' today' : ''}`}
                            style={{ height: `${Math.max((d.hours / maxDayH) * 72, d.hours > 0 ? 4 : 2)}px` }}
                          />
                        </div>
                        <span className={`sd-act-label${d.isToday ? ' today' : ''}`}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="sd-act-legend">
                    <span className="sd-act-legend-item sd-act-legend-today">Today</span>
                    <span className="sd-act-legend-item">Other days</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weak areas */}
        {weakAreas.length > 0 && (
          <div className="card wide sd-alert-card">
            <div className="card-header">
              <h3 className="sd-alert-heading"><AlertTriangle /> Weak Areas Detected</h3>
              <span className="sd-alert-count">{weakAreas.length} subject{weakAreas.length > 1 ? 's' : ''} flagged</span>
            </div>
            <div className="card-body">
              <div className="sd-weak-areas">
                {weakAreas.map(area => (
                  <div key={area.weakAreaId} className="sd-weak-item">
                    <div className="sd-weak-item-left">
                      <span className="sd-weak-subject">{area.subjectName}</span>
                      <span className="sd-weak-date">Flagged {fmtDate(area.detectedDate)}</span>
                    </div>
                    <div className="sd-weak-item-right">
                      <div className="sd-weak-score-row">
                        <div className="sd-weak-track">
                          <div className="sd-weak-fill" style={{ width: `${Math.min((area.avgScore / 10) * 100, 100)}%` }} />
                        </div>
                        <span className="sd-weak-pct">{Number(area.avgScore).toFixed(1)}/10</span>
                      </div>
                      <span className="sd-weak-label">avg productivity</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="sd-weak-hint">Visit the <strong>Notifications</strong> tab for personalised recommendations.</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ─── SESSIONS ─── */
  const renderSessions = () => (
    <div className="tab-content">
      {/* Summary strip */}
      {logs.length > 0 && (
        <div className="sd-summary-strip">
          <div className="sd-summary-item">
            <span className="sd-summary-val">{logs.length}</span>
            <span className="sd-summary-lbl">Total Sessions</span>
          </div>
          <div className="sd-summary-item">
            <span className="sd-summary-val">{st.totalHours}h</span>
            <span className="sd-summary-lbl">Total Hours</span>
          </div>
          <div className="sd-summary-item">
            <span className="sd-summary-val">{st.avgProd}</span>
            <span className="sd-summary-lbl">Avg Productivity</span>
          </div>
        </div>
      )}

      <div className="card wide">
        <div className="card-header">
          <h3>All Study Sessions</h3>
          <button className="btn-primary" onClick={() => setShowSessionForm(true)}>+ Log Session</button>
        </div>
        <div className="card-body">
          {logsLoading ? <p className="sd-loading-text">Loading sessions…</p> :
           logs.length === 0 ? (
             <div className="sd-empty">
               <p>No sessions logged yet. Track your first study session to get started.</p>
               <button className="btn-primary" onClick={() => setShowSessionForm(true)}>Log first session</button>
             </div>
           ) : (
             <table className="data-table">
               <thead><tr>
                 <th>Subject</th><th>Duration</th><th>Date</th><th>Productivity</th><th>Notes</th>
               </tr></thead>
               <tbody>
                 {logs.map(s => (
                   <tr key={s.logId}>
                     <td className="subject-cell">{s.subjectName || '—'}</td>
                     <td>{(s.hoursStudied * 60).toFixed(0)} min</td>
                     <td>{fmtDate(s.dateLogged)}</td>
                     <td><span className={`productivity-badge ${prodClass(s.productivityScore)}`}>★ {s.productivityScore}</span></td>
                     <td className="sd-notes-cell">{s.notes || '—'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  )

  /* ─── GOALS ─── */
  const renderGoals = () => {
    // Find subjects that have more than one active goal
    const subjectGoalCount = {}
    goals.forEach(g => {
      if (g.subjectId) subjectGoalCount[g.subjectId] = (subjectGoalCount[g.subjectId] || 0) + 1
    })
    const hasDuplicates = Object.values(subjectGoalCount).some(c => c > 1)

    return (
      <div className="tab-content">
        {hasDuplicates && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>⚠</span> Some subjects have multiple goals. All logged hours for a subject count toward every goal for that subject — consider keeping one active goal per subject to avoid confusion.
          </div>
        )}
        <div className="card wide">
          <div className="card-header">
            <h3>Your Goals</h3>
            <button className="btn-primary" onClick={() => setShowGoalForm(true)}>+ Add Goal</button>
          </div>
          <div className="card-body">
            {goalsLoading ? <p className="sd-loading-text">Loading goals…</p> :
             goals.length === 0 ? (
               <div className="sd-empty">
                 <p>No goals set yet. Create your first study goal to stay on track.</p>
                 <button className="btn-primary" onClick={() => setShowGoalForm(true)}>Create first goal</button>
               </div>
             ) : (
               <div className="sd-goals-list">
                 {goals.map(g => {
                   const pct    = calcGoalPct(g, logs)
                   const status = getEffectiveStatus(g, logs)
                   const isDup  = subjectGoalCount[g.subjectId] > 1
                   return (
                     <div key={g.goalId} className="sd-goal-row">
                       <div className="sd-goal-main">
                         <div className="sd-goal-title">
                           {g.title || g.subjectName || `Goal #${g.goalId}`}
                           {isDup && <span className="sd-goal-dup-warn" title="Multiple goals for this subject">⚠</span>}
                         </div>
                         <div className="sd-goal-meta">
                           <span>{g.goalType || 'Goal'}</span>
                           <span>·</span>
                           <span>Target: {g.targetHours}h</span>
                           <span>·</span>
                           <span>Due: {fmtDate(g.deadline)}</span>
                         </div>
                       </div>
                       <div className="sd-goal-track-wrap">
                         <div className="sd-goal-track">
                           <div className="sd-goal-fill" style={{ width: `${pct}%` }} />
                         </div>
                         <span className="sd-goal-pct">{pct}%</span>
                       </div>
                       <span className={`status-badge ${goalStatusClass(status)}`}>{status}</span>
                       <button
                         className="sd-goal-delete"
                         onClick={() => handleDeleteGoal(g.goalId, g.title || g.subjectName || `Goal #${g.goalId}`)}
                         disabled={deletingGoalId === g.goalId}
                         aria-label="Delete goal"
                         title="Delete goal"
                       >
                         {deletingGoalId === g.goalId ? '…' : (
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                             <polyline points="3 6 5 6 21 6"/>
                             <path d="M19 6l-1 14H6L5 6"/>
                             <path d="M10 11v6M14 11v6"/>
                             <path d="M9 6V4h6v2"/>
                           </svg>
                         )}
                       </button>
                     </div>
                   )
                 })}
               </div>
             )}
          </div>
        </div>
      </div>
    )
  }

  /* ─── SUBJECTS ─── */
  const renderSubjects = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header"><h3>Available Subjects</h3></div>
        <div className="card-body">
          {subjectsLoading ? <p className="sd-loading-text">Loading subjects…</p> :
           subjects.length === 0 ? (
             <div className="sd-empty"><p>No subjects available yet.</p></div>
           ) : (
             <table className="data-table">
               <thead><tr>
                 <th>Subject</th><th>Category</th><th>Target Hours</th>
               </tr></thead>
               <tbody>
                 {subjects.map(s => (
                   <tr key={s.subjectId}>
                     <td className="subject-cell">{s.name}</td>
                     <td>{s.category || '—'}</td>
                     <td>{s.targetHours ? `${s.targetHours}h` : '—'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  )

  /* ─── ANALYTICS ─── */
  const renderAnalytics = () => (
    <div className="tab-content">
      {/* Summary stat cards */}
      <div className="card wide">
        <div className="card-header"><h3>Study Analytics</h3></div>
        <div className="card-body">
          <div className="sd-analytics-stats">
            <div className="sd-analytics-stat">
              <div className="sd-analytics-val">{logs.length}</div>
              <div className="sd-analytics-lbl">Total Sessions</div>
            </div>
            <div className="sd-analytics-stat">
              <div className="sd-analytics-val">{st.totalHours}h</div>
              <div className="sd-analytics-lbl">Total Hours Logged</div>
            </div>
            <div className="sd-analytics-stat">
              <div className="sd-analytics-val">{st.avgProd}<span className="sd-analytics-unit">/10</span></div>
              <div className="sd-analytics-lbl">Avg Productivity</div>
            </div>
            <div className="sd-analytics-stat">
              <div className="sd-analytics-val">{st.completedGoals}/{st.totalGoals}</div>
              <div className="sd-analytics-lbl">Goals Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly report */}
      <div className="card wide">
        <div className="card-header"><h3>Weekly Report — by Subject</h3></div>
        <div className="card-body">
          {reportLoading ? <p className="sd-loading-text">Loading weekly report…</p> :
           weeklyReport.length === 0 ? (
             <div className="sd-empty"><p>No weekly data yet. Log some sessions to see your report.</p></div>
           ) : (
             <table className="data-table">
               <thead><tr>
                 <th>Week</th><th>Subject</th><th>Sessions</th>
                 <th>Total Hours</th><th>Avg Productivity</th><th>Best Score</th>
               </tr></thead>
               <tbody>
                 {weeklyReport.map((row, i) => (
                   <tr key={i}>
                     <td>{fmtDate(row.weekStart)}</td>
                     <td className="subject-cell">{row.subjectName}</td>
                     <td>{row.sessionCount}</td>
                     <td>{row.totalHours}h</td>
                     <td><span className={`productivity-badge ${prodClass(row.avgProductivity)}`}>★ {row.avgProductivity}</span></td>
                     <td><span className={`productivity-badge ${prodClass(row.maxProductivity)}`}>★ {row.maxProductivity}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>

      {/* Study scope */}
      <div className="card wide">
        <div className="card-header"><h3>Active Study Scope — last 7 days + goals</h3></div>
        <div className="card-body">
          {scopeLoading ? <p className="sd-loading-text">Loading study scope…</p> :
           studyScope.length === 0 ? (
             <div className="sd-empty"><p>No active subjects found. Study a subject or create a goal to see your scope.</p></div>
           ) : (
             <table className="data-table">
               <thead><tr><th>Subject</th><th>Source</th></tr></thead>
               <tbody>
                 {studyScope.map((item, i) => (
                   <tr key={i}>
                     <td className="subject-cell">{item.subjectName}</td>
                     <td>
                       <span className={`status-badge ${
                         item.source === 'Studied & Has Goal' ? 'status-active' :
                         item.source === 'Studied' ? 'sd-source-studied' : 'sd-source-goal'
                       }`}>{item.source}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  )

  /* ─── NOTIFICATIONS ─── */
  const renderNotifications = () => <StudentNotifications />

  /* ─── SETTINGS / PROFILE ─── */
  const renderSettings = () => {
    const initials = studentData.name
      .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
      <div className="tab-content">
        {!isEditingProfile ? (
          <div className="card wide">
            <div className="card-header">
              <h3>Profile</h3>
              <button className="btn-primary" onClick={() => { setEditData(studentData); setIsEditingProfile(true) }}>
                Edit Profile
              </button>
            </div>
            <div className="card-body">
              {profileSuccess && (
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  <span>✓</span> {profileSuccess}
                </div>
              )}

              {/* Avatar + name header */}
              <div className="sd-profile-header">
                <div className="sd-profile-avatar">{initials}</div>
                <div className="sd-profile-name">{studentData.name}</div>
                <div className="sd-profile-role">{studentData.department} · {studentData.semester}</div>
                <div className="sd-profile-enroll">{studentData.enrollmentNumber}</div>
              </div>

              {/* Info grid */}
              <div className="sd-profile-grid">
                <div className="sd-profile-field">
                  <label>Email Address</label>
                  <p>{studentData.email}</p>
                </div>
                <div className="sd-profile-field">
                  <label>Phone</label>
                  <p>{studentData.phone}</p>
                </div>
                <div className="sd-profile-field">
                  <label>Department</label>
                  <p>{studentData.department}</p>
                </div>
                <div className="sd-profile-field">
                  <label>Semester</label>
                  <p>{studentData.semester}</p>
                </div>
                <div className="sd-profile-field">
                  <label>Enrollment Number</label>
                  <p>{studentData.enrollmentNumber}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card wide">
            <div className="card-header">
              <h3>Edit Profile</h3>
            </div>
            <div className="card-body">
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="+92-300-0000000"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      value={editData.department}
                      onChange={e => setEditData({ ...editData, department: e.target.value })}
                      placeholder="e.g. Software Engineering"
                    />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <input
                      value={editData.semester}
                      onChange={e => setEditData({ ...editData, semester: e.target.value })}
                      placeholder="e.g. 4th Semester"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address <span className="sd-field-readonly">(read-only)</span></label>
                    <input value={studentData.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Enrollment Number <span className="sd-field-readonly">(read-only)</span></label>
                    <input value={studentData.enrollmentNumber} disabled />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={handleProfileSave}
                  disabled={!editData.name.trim()}
                >
                  Save Changes
                </button>
                <button className="btn-secondary" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Danger Zone ── */}
        <div className="sd-danger-card">
          <div className="sd-danger-header">
            <div className="sd-danger-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div className="sd-danger-title">Danger Zone</div>
              <div className="sd-danger-sub">Irreversible and destructive actions</div>
            </div>
          </div>

          <div className="sd-danger-row">
            <div className="sd-danger-info">
              <div className="sd-danger-action-title">Delete Account</div>
              <div className="sd-danger-action-desc">
                Permanently delete your account, all study sessions, goals, and associated data. This cannot be undone.
              </div>
            </div>
            {!showDeleteZone ? (
              <button
                className="sd-danger-trigger"
                onClick={() => { setShowDeleteZone(true); setDeleteConfirmText(''); setDeleteError('') }}
              >
                Delete Account
              </button>
            ) : (
              <button className="sd-danger-trigger sd-danger-trigger--muted" onClick={() => setShowDeleteZone(false)}>
                Cancel
              </button>
            )}
          </div>

          {showDeleteZone && (
            <div className="sd-danger-confirm">
              <p className="sd-danger-confirm-msg">
                To confirm, type <strong>DELETE</strong> in the box below:
              </p>
              <input
                className="sd-danger-input"
                type="text"
                value={deleteConfirmText}
                onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError('') }}
                placeholder="Type DELETE to confirm"
                autoComplete="off"
              />
              {deleteError && (
                <div className="sd-danger-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {deleteError}
                </div>
              )}
              <button
                className="sd-confirm-btn-danger"
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? 'Deleting…' : 'Permanently Delete My Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderContent = (activeTab) => {
    switch (activeTab) {
      case 'overview':      return renderOverview()
      case 'sessions':      return renderSessions()
      case 'goals':         return renderGoals()
      case 'subjects':      return renderSubjects()
      case 'analytics':     return renderAnalytics()
      case 'notifications': return renderNotifications()
      case 'settings':      return renderSettings()
      default:              return renderOverview()
    }
  }

  return (
    <DashboardLayout userType="student" displayName={studentData.name}>
      {({ activeTab }) => (
        <div className="dashboard-container" key={activeTab}>
          <div className="tab-content-wrapper">
            <div className="tab-content-container">
              {renderContent(activeTab)}
            </div>
          </div>

          {showSessionForm && (
            <LogSessionForm
              studentId={studentId}
              onSuccess={handleSessionLogged}
              onCancel={() => setShowSessionForm(false)}
            />
          )}

          {showGoalForm && (
            <CreateGoalForm
              studentId={studentId}
              onSuccess={handleGoalCreated}
              onCancel={() => setShowGoalForm(false)}
            />
          )}

          {confirmDialog && (
            <div className="sd-confirm-overlay">
              <div className="sd-confirm-box">
                <div className="sd-confirm-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                       strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </div>
                <h4 className="sd-confirm-title">Delete Goal</h4>
                <p className="sd-confirm-msg">
                  Are you sure you want to delete <strong>"{confirmDialog.title}"</strong>?<br/>
                  This action cannot be undone.
                </p>
                <div className="sd-confirm-actions">
                  <button className="sd-confirm-btn-danger" onClick={doDeleteGoal}>Delete</button>
                  <button className="btn-secondary" onClick={() => setConfirmDialog(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
