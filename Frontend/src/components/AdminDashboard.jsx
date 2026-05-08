import { useState, useMemo, useRef } from 'react'
import DashboardLayout from './DashboardLayout'
import AdminRecommendations from './AdminRecommendations'
import SubjectManagement from './SubjectManagement'
import StudentManagement from './StudentManagement'
import NotificationDeliveryDemo from './NotificationDeliveryDemo'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAllRecommendations, useAnalyticsData, useWeakAreaStats, useStudentPerformance, useRollupAnalytics, useBelowAverage, useEngagedStudents, useAdminProfile, useAdminDepartments, useAdminSemesters } from '../hooks/useAdminData'
import './Dashboard.css'
import './AdminDashboard.css'

/* ── Inline SVG icons ─────────────────────────────────── */
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

/* ── Helpers ──────────────────────────────────────────── */
const prodClass = score => score >= 8 ? 'prod-high' : score >= 5 ? 'prod-mid' : 'prod-low'

const getRollupRowType = row => {
  if (row.studentId === null)   return 'grand'
  if (row.subjectName === null) return 'student-total'
  if (row.year === null)        return 'subject-total'
  return 'detail'
}

const rollupRowClass = type =>
  type === 'grand'         ? 'rollup-grand'   :
  type === 'student-total' ? 'rollup-student' :
  type === 'subject-total' ? 'rollup-subject' : ''

export default function AdminDashboard() {
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const deptHook = useAdminDepartments()
  const semHook  = useAdminSemesters()
  const [newDept, setNewDept] = useState('')
  const [newSem,  setNewSem]  = useState('')

  const { recommendations, loading: recommendationsLoading } = useAllRecommendations()
  const { analyticsData, loading: analyticsLoading }         = useAnalyticsData()
  const { weakAreaStats, loading: weakAreaLoading }           = useWeakAreaStats()
  const { studentPerformance, loading: performanceLoading }   = useStudentPerformance()
  const { rollupData, loading: rollupLoading }                = useRollupAnalytics()
  const { belowAvg, systemAvg, loading: belowAvgLoading }     = useBelowAverage()
  const { engaged, loading: engagedLoading }                  = useEngagedStudents()
  const { profile: adminProfile }                             = useAdminProfile()

  const safeAnalytics = analyticsData || {}
  const weakAreas     = weakAreaStats?.topWeakSubjects || []

  const [adminData] = useState({
    name:  localStorage.getItem('userName')  || 'Administrator',
    email: localStorage.getItem('userEmail') || 'admin@bahria.edu.pk',
    role:  'System Administrator',
  })
  const [editData, setEditData] = useState(adminData)

  /* ── Real performance data from rollup ──────────────── */
  const studentPerfMap = useMemo(() => {
    const map = {}
    rollupData.forEach(row => {
      if (row.studentId !== null && row.subjectName === null &&
          row.year === null && row.month === null) {
        map[row.studentId] = {
          sessions: Number(row.sessionCount) || 0,
          hours:    Number(row.totalHours)   || 0,
          avgProd:  Number(row.avgProductivity) || 0,
        }
      }
    })
    return map
  }, [rollupData])

  const studentSubjectCounts = useMemo(() => {
    const map = {}
    rollupData.forEach(row => {
      if (row.studentId !== null && row.subjectName !== null &&
          row.year === null && row.month === null) {
        map[row.studentId] = (map[row.studentId] || 0) + 1
      }
    })
    return map
  }, [rollupData])

  const perfTableData = useMemo(() => {
    return studentPerformance
      .map(s => ({
        name:       s.name,
        email:      s.email,
        enrollment: s.enrollment,
        status:     s.status,
        sessions:   (studentPerfMap[s.id] || {}).sessions || 0,
        hours:      (studentPerfMap[s.id] || {}).hours    || 0,
        avgProd:    (studentPerfMap[s.id] || {}).avgProd  || 0,
        subjects:   studentSubjectCounts[s.id]            || 0,
      }))
      .sort((a, b) => b.avgProd - a.avgProd)
  }, [studentPerformance, studentPerfMap, studentSubjectCounts])

  /* ── Stats ──────────────────────────────────────────── */
  const stats = [
    { label: 'Total Hours Logged', value: analyticsLoading ? '—' : `${safeAnalytics.totalHoursLogged ?? 0}h`, change: 'All time',          variant: '' },
    { label: 'Engagement Rate',    value: analyticsLoading ? '—' : `${safeAnalytics.engagementRate  || 0}%`,  change: 'Active / enrolled', variant: 'stat-change--blue' },
    { label: 'Avg Productivity',   value: analyticsLoading ? '—' : `${safeAnalytics.avgProductivity || 0}/10`,change: 'Platform-wide',     variant: 'stat-change--gold' },
    { label: 'Active Students',    value: analyticsLoading ? '—' : String(safeAnalytics.activeStudents || 0), change: 'Enrolled & active', variant: 'stat-change--purple' },
  ]

  const handleSaveProfile = () => {
    setIsEditingProfile(false)
  }

  /* ─── OVERVIEW ──────────────────────────────────────── */
  const renderOverview = () => (
    <div className="tab-content">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-box">
            <div className="stat-header">
              <span className="stat-label">{s.label}</span>
              <span className={`stat-change ${s.variant}`}>{s.change}</span>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        {/* Platform KPI strip */}
        <div className="card">
          <div className="card-header"><h3>Platform at a Glance</h3></div>
          <div className="card-body">
            <div className="ad-kpi-strip">
              <div className="ad-kpi-item ad-kpi--blue">
                <div className="ad-kpi-icon"><BellIcon /></div>
                <div className="ad-kpi-val">
                  {recommendationsLoading ? '—' : recommendations.length}
                </div>
                <div className="ad-kpi-lbl">Active Recommendations</div>
              </div>
              <div className="ad-kpi-item ad-kpi--red">
                <div className="ad-kpi-icon"><AlertIcon /></div>
                <div className="ad-kpi-val">
                  {weakAreaLoading ? '—' : weakAreas.length}
                </div>
                <div className="ad-kpi-lbl">Weak Areas Flagged</div>
              </div>
              <div className="ad-kpi-item ad-kpi--green">
                <div className="ad-kpi-icon"><UsersIcon /></div>
                <div className="ad-kpi-val">
                  {analyticsLoading ? '—' : safeAnalytics.activeStudents || 0}
                </div>
                <div className="ad-kpi-lbl">Active Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent recommendations */}
        <div className="card">
          <div className="card-header"><h3>Recent Recommendations</h3></div>
          <div className="card-body">
            {recommendationsLoading ? (
              <p className="sd-loading-text">Loading…</p>
            ) : recommendations.length === 0 ? (
              <div className="sd-empty"><p>No recommendations yet.</p></div>
            ) : (
              <div className="ad-rec-list">
                {recommendations.slice(0, 4).map((rec, i) => (
                  <div key={i} className="ad-rec-item">
                    <span className="ad-rec-type">{rec.type || 'General'}</span>
                    <p className="ad-rec-desc">{rec.description || rec.message}</p>
                    <span className="ad-rec-date">
                      {new Date(rec.dateCreated || rec.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  /* ─── ANALYTICS ─────────────────────────────────────── */
  const renderAnalytics = () => (
    <div className="tab-content">
      <div className="content-grid">
        {/* Weekly chart — light theme */}
        <div className="card wide">
          <div className="card-header"><h3>Weekly Study Hours</h3></div>
          <div className="card-body">
            {analyticsLoading ? (
              <p className="sd-loading-text">Loading chart…</p>
            ) : !safeAnalytics.weeklyStats || safeAnalytics.weeklyStats.length === 0 ? (
              <div className="sd-empty" style={{ height: 220 }}>
                <p>No sessions logged this week yet.</p>
              </div>
            ) : (
              <div style={{ height: 280, width: '100%', marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeAnalytics.weeklyStats} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="day" stroke="#afafaf" tick={{ fontSize: 12, fontWeight: 700, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#afafaf" tick={{ fontSize: 11, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e5e5e5', borderRadius: '10px', boxShadow: '0 4px 16px rgba(16,15,62,0.08)' }}
                      itemStyle={{ color: '#58cc02', fontWeight: 700, fontFamily: 'Nunito' }}
                      labelStyle={{ color: '#100f3e', fontWeight: 800, fontFamily: 'Nunito' }}
                      cursor={{ fill: 'rgba(88,204,2,0.06)' }}
                    />
                    <Bar dataKey="hours" fill="#58cc02" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* System metrics */}
        <div className="card">
          <div className="card-header"><h3>System Metrics</h3></div>
          <div className="card-body">
            <div className="ad-metrics-list">
              {[
                { label: 'Engagement Rate',   value: `${safeAnalytics.engagementRate || 0}%` },
                { label: 'Avg Productivity',  value: `${safeAnalytics.avgProductivity || 0}/10` },
                { label: 'Total Sessions',    value: safeAnalytics.totalSessions || 0 },
                { label: 'Total Students',    value: safeAnalytics.totalStudents  || 0 },
                { label: 'Active Students',   value: safeAnalytics.activeStudents || 0 },
              ].map((m, i) => (
                <div key={i} className="ad-metric-row">
                  <span className="ad-metric-label">{m.label}</span>
                  <span className="ad-metric-value">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Below-average students */}
      <div className="card wide">
        <div className="card-header">
          <h3>Students Below System Average</h3>
          {!belowAvgLoading && systemAvg > 0 && (
            <span className={`productivity-badge ${prodClass(systemAvg)}`}>
              System avg ★ {systemAvg}
            </span>
          )}
        </div>
        <div className="card-body">
          {belowAvgLoading ? (
            <p className="sd-loading-text">Loading…</p>
          ) : belowAvg.length === 0 ? (
            <div className="sd-empty"><p>No students below the system average — great performance!</p></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Student</th><th>Email</th><th>Avg Score</th><th>vs System Avg</th>
              </tr></thead>
              <tbody>
                {belowAvg.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td><span className="productivity-badge prod-low">★ {s.avgScore}</span></td>
                    <td><span className="neg-delta">{(s.avgScore - systemAvg).toFixed(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Engaged students */}
      <div className="card wide">
        <div className="card-header"><h3>Highly Engaged Students</h3></div>
        <div className="card-body">
          {engagedLoading ? (
            <p className="sd-loading-text">Loading…</p>
          ) : engaged.length === 0 ? (
            <div className="sd-empty"><p>No students both studied this week and have an active goal.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Student</th><th>Email</th></tr></thead>
              <tbody>
                {engaged.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ROLLUP breakdown */}
      <div className="card wide">
        <div className="card-header"><h3>Session Analytics Breakdown</h3></div>
        <div className="card-body">
          {rollupLoading ? (
            <p className="sd-loading-text">Loading breakdown…</p>
          ) : rollupData.length === 0 ? (
            <div className="sd-empty"><p>No study data available yet.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Student</th><th>Subject</th><th>Year</th><th>Month</th>
                <th>Sessions</th><th>Total Hours</th><th>Avg Productivity</th>
              </tr></thead>
              <tbody>
                {rollupData.slice(0, 50).map((row, i) => {
                  const type = getRollupRowType(row)
                  return (
                    <tr key={i} className={rollupRowClass(type)}>
                      <td>
                        {type === 'grand'         ? 'GRAND TOTAL'                       :
                         type === 'student-total' ? `Student #${row.studentId} — Total` :
                         type === 'subject-total' ? `↳ ${row.subjectName} — Total`      :
                         `Student #${row.studentId}`}
                      </td>
                      <td>{row.subjectName ?? '—'}</td>
                      <td>{row.year  ?? '—'}</td>
                      <td>{row.month ?? '—'}</td>
                      <td>{String(row.sessionCount)}</td>
                      <td>{row.totalHours ?? '—'}h</td>
                      <td>
                        {row.avgProductivity !== null
                          ? <span className={`productivity-badge ${prodClass(row.avgProductivity)}`}>★ {row.avgProductivity}</span>
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {rollupData.length > 50 && (
            <p className="ad-info-text">Showing first 50 of {rollupData.length} rows.</p>
          )}
        </div>
      </div>
    </div>
  )

  /* ─── PERFORMANCE ────────────────────────────────────── */
  const renderPerformance = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header"><h3>Student Performance Overview</h3></div>
        <div className="card-body">
          {(performanceLoading || rollupLoading) ? (
            <p className="sd-loading-text">Loading performance data…</p>
          ) : perfTableData.length === 0 ? (
            <div className="sd-empty"><p>No student data available yet.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Student</th>
                <th>Sessions</th>
                <th>Hours</th>
                <th>Avg Productivity</th>
                <th>Subjects</th>
                <th>Status</th>
              </tr></thead>
              <tbody>
                {perfTableData.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div className="ad-perf-name">{row.name}</div>
                      <div className="ad-perf-enroll">{row.enrollment}</div>
                    </td>
                    <td>{row.sessions > 0 ? row.sessions : '—'}</td>
                    <td>{row.hours > 0 ? `${Number(row.hours).toFixed(1)}h` : '—'}</td>
                    <td>
                      {row.avgProd > 0
                        ? <span className={`productivity-badge ${prodClass(row.avgProd)}`}>★ {Number(row.avgProd).toFixed(1)}</span>
                        : '—'}
                    </td>
                    <td>{row.subjects > 0 ? row.subjects : '—'}</td>
                    <td>
                      <span className={`status-badge ${row.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {row.status}
                      </span>
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

  /* ─── REPORTS ────────────────────────────────────────── */
  const downloadReport = (format) => {
    const token = localStorage.getItem('token')
    fetch(`/api/admin/reports/export?format=${format}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => { if (!res.ok) throw new Error('Export failed'); return res.blob() })
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href    = url
        a.download = `studysphere-report-${new Date().toISOString().slice(0, 10)}.${format}`
        document.body.appendChild(a); a.click(); a.remove()
        URL.revokeObjectURL(url)
      })
      .catch(err => alert('Failed to download report: ' + err.message))
  }

  const renderReports = () => (
    <div className="tab-content">
      {/* Export card */}
      <div className="card wide">
        <div className="card-header"><h3>Export Analytics Report</h3></div>
        <div className="card-body">
          <p className="ad-info-text" style={{ marginBottom: 20 }}>
            The same analytics data is adapted to different output formats by{' '}
            <strong>CsvReportAdapter</strong> and <strong>JsonReportAdapter</strong>,
            both implementing the <code>IReportGenerator</code> interface (Adapter Pattern).
          </p>
          <div className="ad-export-row">
            <button className="ad-export-btn ad-export-csv" onClick={() => downloadReport('csv')}>
              <div className="ad-export-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="ad-export-btn-text">
                <span className="ad-export-btn-label">CSV Report</span>
                <span className="ad-export-btn-sub">Spreadsheet-ready format</span>
              </div>
              <svg className="ad-export-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>

            <button className="ad-export-btn ad-export-json" onClick={() => downloadReport('json')}>
              <div className="ad-export-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 15l-2-2 2-2"/><path d="M15 11l2 2-2 2"/>
                </svg>
              </div>
              <div className="ad-export-btn-text">
                <span className="ad-export-btn-label">JSON Report</span>
                <span className="ad-export-btn-sub">API / developer format</span>
              </div>
              <svg className="ad-export-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Notification delivery card */}
      <div className="card wide">
        <div className="card-header">
          <h3>Notification Delivery Channels</h3>
          <span className="ad-pattern-tag">Decorator Pattern</span>
        </div>
        <div className="card-body"><NotificationDeliveryDemo /></div>
      </div>
    </div>
  )

  /* ─── SETTINGS ───────────────────────────────────────── */
  const renderSettings = () => {
    const displayName = adminProfile?.name || adminData.name
    const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const joinDate    = adminProfile?.joinDate || '—'

    return (
      <div className="tab-content">
        {!isEditingProfile ? (
          <div className="card wide">
            <div className="card-header">
              <h3>Admin Profile</h3>
              <button className="btn-primary" onClick={() => { setEditData(adminData); setIsEditingProfile(true) }}>
                Edit Profile
              </button>
            </div>
            <div className="card-body">
              <div className="ad-profile-header">
                <div className="ad-profile-avatar">{initials}</div>
                <div className="ad-profile-name">{displayName}</div>
                <div className="ad-profile-role">{adminData.role}</div>
                <div className="ad-profile-badge">Admin</div>
              </div>
              <div className="ad-profile-grid">
                <div className="ad-profile-field">
                  <label>Email Address</label>
                  <p>{adminData.email}</p>
                </div>
                <div className="ad-profile-field">
                  <label>Account Since</label>
                  <p>{joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card wide">
            <div className="card-header"><h3>Edit Profile</h3></div>
            <div className="card-body">
              <div className="ad-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="ad-field-readonly">(read-only)</span></label>
                    <input value={adminData.email} disabled />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                <button className="btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Department Management ── */}
        <div className="card wide" style={{ marginTop: '24px' }}>
          <div className="card-header"><h3>Departments</h3></div>
          <div className="card-body">
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '16px' }}>
              These are the departments students can select during signup.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                className="ad-settings-input"
                placeholder="e.g. Computer Science"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); deptHook.add(newDept).then(r => r.success && setNewDept('')) } }}
              />
              <button
                className="btn-primary"
                disabled={!newDept.trim() || deptHook.saving}
                onClick={() => deptHook.add(newDept).then(r => r.success && setNewDept(''))}
              >
                Add
              </button>
            </div>
            {deptHook.error && <p className="ad-settings-error">{deptHook.error}</p>}
            {deptHook.loading ? <p style={{ color: 'var(--text-2)' }}>Loading…</p> : (
              <div className="ad-settings-list">
                {deptHook.departments.length === 0
                  ? <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>No departments added yet.</p>
                  : deptHook.departments.map(d => (
                    <div key={d.departmentId} className="ad-settings-item">
                      <span>{d.name}</span>
                      <button
                        className="ad-settings-delete"
                        onClick={() => deptHook.remove(d.departmentId)}
                        disabled={deptHook.saving}
                        title="Remove"
                      >✕</button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* ── Semester Management ── */}
        <div className="card wide" style={{ marginTop: '24px' }}>
          <div className="card-header"><h3>Semesters</h3></div>
          <div className="card-body">
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '16px' }}>
              These are the semester options students can select during signup.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                className="ad-settings-input"
                placeholder="e.g. 4th Semester"
                value={newSem}
                onChange={e => setNewSem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); semHook.add(newSem).then(r => r.success && setNewSem('')) } }}
              />
              <button
                className="btn-primary"
                disabled={!newSem.trim() || semHook.saving}
                onClick={() => semHook.add(newSem).then(r => r.success && setNewSem(''))}
              >
                Add
              </button>
            </div>
            {semHook.error && <p className="ad-settings-error">{semHook.error}</p>}
            {semHook.loading ? <p style={{ color: 'var(--text-2)' }}>Loading…</p> : (
              <div className="ad-settings-list">
                {semHook.semesters.length === 0
                  ? <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>No semesters added yet.</p>
                  : semHook.semesters.map(s => (
                    <div key={s.semesterOptionId} className="ad-settings-item">
                      <span>{s.name}</span>
                      <button
                        className="ad-settings-delete"
                        onClick={() => semHook.remove(s.semesterOptionId)}
                        disabled={semHook.saving}
                        title="Remove"
                      >✕</button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderContent = (activeTab) => {
    switch (activeTab) {
      case 'overview':        return renderOverview()
      case 'students':        return <StudentManagement />
      case 'subjects':        return <SubjectManagement />
      case 'analytics':       return renderAnalytics()
      case 'performance':     return renderPerformance()
      case 'recommendations': return <AdminRecommendations />
      case 'reports':         return renderReports()
      case 'settings':        return renderSettings()
      default:                return renderOverview()
    }
  }

  return (
    <DashboardLayout userType="admin">
      {({ activeTab }) => (
        <div className="dashboard-container" key={activeTab}>
          <div className="tab-content-wrapper">
            <div className="tab-content-container">
              {renderContent(activeTab)}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
