import { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import AdminRecommendations from './AdminRecommendations'
import SubjectManagement from './SubjectManagement'
import StudentManagement from './StudentManagement'
import NotificationDeliveryDemo from './NotificationDeliveryDemo'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAllRecommendations, useAnalyticsData, useWeakAreaStats, useStudentPerformance, useRollupAnalytics, useBelowAverage, useEngagedStudents } from '../hooks/useAdminData'
import './Dashboard.css'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Fetch real data from API
  const { recommendations, loading: recommendationsLoading } = useAllRecommendations()
  const { analyticsData, loading: analyticsLoading } = useAnalyticsData()
  const { weakAreaStats, loading: weakAreaLoading } = useWeakAreaStats()
  const { studentPerformance, loading: performanceLoading } = useStudentPerformance()
  const { rollupData, loading: rollupLoading } = useRollupAnalytics()
  const { belowAvg, systemAvg, loading: belowAvgLoading } = useBelowAverage()
  const { engaged, loading: engagedLoading } = useEngagedStudents()

  const [adminData] = useState({
    name: 'Dr. Muhammad Ali',
    email: 'admin@bahria.edu.pk',
    phone: '+92-300-9876543',
    role: 'System Administrator',
    department: 'Computer Science',
    joinDate: 'January 2025',
  })

  const [editData, setEditData] = useState(adminData)

  // Safe references with fallback defaults
  const safeAnalytics = analyticsData || {}
  const weakAreas = weakAreaStats?.topWeakSubjects || []

  // Placeholder data for tabs not yet connected to backend
  const performanceData = [
    { student: 'Ahmed Khan', ds: 92, dbms: 88, web: 95, avg: 91.7 },
    { student: 'Sara Ali', ds: 85, dbms: 91, web: 89, avg: 88.3 },
    { student: 'Usman Tariq', ds: 78, dbms: 82, web: 86, avg: 82.0 },
  ]

  const reportsData = [
    { id: 1, title: 'Monthly Performance Report', type: 'Performance', date: 'Apr 2025', status: 'Ready' },
    { id: 2, title: 'Weak Area Analysis', type: 'Analytics', date: 'Apr 2025', status: 'Processing' },
  ]

  // Calculate dashboard statistics from API data
  const calculateStats = () => {
    const totalHours = safeAnalytics.totalSessions ? (safeAnalytics.totalSessions / 10).toFixed(0) : 0
    const avgProductivity = safeAnalytics.avgProductivity || 0
    
    return {
      totalHours,
      avgProductivity,
      engagementRate: safeAnalytics.engagementRate || 0,
    }
  }

  const stats = [
    { label: 'Total Hours Logged', value: `${calculateStats().totalHours}h`, change: '+245h this week', color: '#10b981' },
    { label: 'Engagement Rate', value: `${calculateStats().engagementRate}%`, change: 'Overall', color: '#3b82f6' },
    { label: 'Avg Productivity', value: `${calculateStats().avgProductivity}/10`, change: 'All students', color: '#f59e0b' },
    { label: 'Active This Week', value: '118', change: '94.4%', color: '#8b5cf6' },
  ]



  const handleSaveProfile = () => {
    setIsEditingProfile(false)
  }

  const renderOverview = () => (
    <div className="tab-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-box">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-change" style={{ color: stat.color }}>{stat.change}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* System Overview */}
        <div className="card wide">
          <div className="card-header">
            <h3>System Overview</h3>
          </div>
          <div className="card-body">
            {analyticsLoading ? (
              <p>Loading analytics...</p>
            ) : (
              <div className="overview-metrics">
                <p>📊 Analytics data fetched from backend</p>
                <p>💡 {recommendationsLoading ? 'Loading...' : recommendations.length} recommendations active</p>
                <p>⚠️ {weakAreaLoading ? 'Loading...' : weakAreas.length} weak areas identified</p>
              </div>
            )}
          </div>
        </div>

        {/* Weak Areas Summary */}
        {weakAreas.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Weak Areas Alert</h3>
            </div>
            <div className="card-body">
              <div className="weak-areas-summary">
                {weakAreas.slice(0, 3).map((area, idx) => (
                  <div key={idx} className="weak-item">
                    <span className="subject">{area.subject || area.subjectName}</span>
                    <span className="avg">{area.avgScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Recommendations */}
      <div className="card wide">
        <div className="card-header">
          <h3>Recent Recommendations</h3>
        </div>
        <div className="card-body">
          {recommendationsLoading ? (
            <p>Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p className="empty-state">No recommendations yet.</p>
          ) : (
            <div className="recommendations-list">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <div className="rec-type">{rec.type || 'Recommendation'}</div>
                  <p>{rec.description || rec.message}</p>
                  <span className="rec-date">{new Date(rec.dateCreated || rec.createdDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )



  const renderAnalytics = () => (
    <div className="tab-content">
      {/* Overview chart */}
      <div className="content-grid">
        <div className="card wide">
          <div className="card-header"><h3>Weekly Study Hours</h3></div>
          <div className="card-body">
            <div className="analytics-chart" style={{ height: '300px', width: '100%', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeAnalytics.weeklyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#ff5c28' }}
                  />
                  <Bar dataKey="hours" fill="#ff5c28" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>System Metrics</h3></div>
          <div className="card-body">
            <div className="metrics-list">
              <div className="metric-item">
                <span className="metric-label">Engagement Rate:</span>
                <span className="metric-value">{safeAnalytics.engagementRate || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg Productivity:</span>
                <span className="metric-value">{safeAnalytics.avgProductivity || 0}/10</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Sessions:</span>
                <span className="metric-value">{safeAnalytics.totalSessions || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Students:</span>
                <span className="metric-value">{safeAnalytics.totalStudents || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Active Students:</span>
                <span className="metric-value">{safeAnalytics.activeStudents || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lab 6 — Below Average Students (subquery) */}
      <div className="card wide">
        <div className="card-header">
          <h3>Below-Average Students (Lab 6)</h3>
          {!belowAvgLoading && <span className="card-subtitle">System avg: ★ {systemAvg}/10</span>}
        </div>
        <div className="card-body">
          {belowAvgLoading ? (
            <p>Loading...</p>
          ) : belowAvg.length === 0 ? (
            <p className="empty-state">No students below the system average. Great performance!</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Student</th><th>Email</th><th>Avg Score</th><th>vs System Avg</th></tr>
              </thead>
              <tbody>
                {belowAvg.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td><span className="productivity-badge" style={{ background: '#ef444422' }}>★ {s.avgScore}</span></td>
                    <td style={{ color: '#ef4444' }}>{(s.avgScore - systemAvg).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lab 5 — Engaged Students (INTERSECT) */}
      <div className="card wide">
        <div className="card-header"><h3>Engaged Students This Week (Lab 5 — INTERSECT)</h3></div>
        <div className="card-body">
          {engagedLoading ? (
            <p>Loading...</p>
          ) : engaged.length === 0 ? (
            <p className="empty-state">No students both studied this week and have an active goal.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Student</th><th>Email</th></tr>
              </thead>
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

      {/* Lab 12 — ROLLUP aggregation */}
      <div className="card wide">
        <div className="card-header"><h3>ROLLUP Analytics — Sessions by Student / Subject / Month (Lab 12)</h3></div>
        <div className="card-body">
          {rollupLoading ? (
            <p>Loading rollup data...</p>
          ) : rollupData.length === 0 ? (
            <p className="empty-state">No study data available for rollup analysis.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th><th>Subject</th><th>Year</th><th>Month</th>
                  <th>Sessions</th><th>Total Hours</th><th>Avg Productivity</th>
                </tr>
              </thead>
              <tbody>
                {rollupData.slice(0, 50).map((row, i) => (
                  <tr key={i} style={{ opacity: row.studentId === null ? 0.6 : 1, fontWeight: row.studentId === null ? 'bold' : 'normal' }}>
                    <td>{row.studentId ?? '— ALL —'}</td>
                    <td>{row.subjectName ?? '— ALL —'}</td>
                    <td>{row.year ?? '—'}</td>
                    <td>{row.month ?? '—'}</td>
                    <td>{String(row.sessionCount)}</td>
                    <td>{row.totalHours ?? '—'}h</td>
                    <td>{row.avgProductivity !== null ? `★ ${row.avgProductivity}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {rollupData.length > 50 && <p className="info-text">Showing first 50 of {rollupData.length} rows.</p>}
        </div>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Student Subject Performance</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Data Structures</th>
                <th>DBMS</th>
                <th>Web Dev</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.student}</strong></td>
                  <td>
                    <span className="score" style={{ color: row.ds >= 90 ? '#10b981' : '#f59e0b' }}>
                      {row.ds}%
                    </span>
                  </td>
                  <td>
                    <span className="score" style={{ color: row.dbms >= 90 ? '#10b981' : '#f59e0b' }}>
                      {row.dbms}%
                    </span>
                  </td>
                  <td>
                    <span className="score" style={{ color: row.web >= 90 ? '#10b981' : '#f59e0b' }}>
                      {row.web}%
                    </span>
                  </td>
                  <td><strong>{row.avg.toFixed(1)}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const downloadReport = (format) => {
    const token = localStorage.getItem('token')
    fetch(`/api/admin/reports/export?format=${format}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Export failed')
        return res.blob()
      })
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `studysphere-report-${new Date().toISOString().slice(0, 10)}.${format}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      })
      .catch(err => alert('Failed to download report: ' + err.message))
  }

  const renderReports = () => (
    <div className="tab-content">
      {/* Adapter Pattern — export analytics data as CSV or JSON */}
      <div className="card wide">
        <div className="card-header"><h3>Export Analytics Report (Adapter Pattern)</h3></div>
        <div className="card-body">
          <p className="info-text" style={{ marginBottom: '16px' }}>
            The same analytics data is adapted to different output formats (CSV or JSON)
            by <strong>CsvReportAdapter</strong> and <strong>JsonReportAdapter</strong>,
            both implementing the <code>IReportGenerator</code> interface.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => downloadReport('csv')}>
              Download CSV Report
            </button>
            <button className="btn-secondary" onClick={() => downloadReport('json')}>
              Download JSON Report
            </button>
          </div>
        </div>
      </div>

      {/* Decorator Pattern demo — trigger multi-channel notification delivery */}
      <div className="card wide">
        <div className="card-header"><h3>Notification Delivery Channels (Decorator Pattern)</h3></div>
        <div className="card-body">
          <NotificationDeliveryDemo />
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Admin Profile</h3>
          {!isEditingProfile && (
            <button 
              className="btn-primary" 
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
        <div className="card-body">
          {!isEditingProfile ? (
            <div className="profile-view">
              <div className="profile-section">
                <div className="profile-avatar">{adminData.name.substring(0, 2).toUpperCase()}</div>
                <div className="profile-header-info">
                  <h2>{adminData.name}</h2>
                  <p className="role">{adminData.role}</p>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <label>Email:</label>
                  <p>{adminData.email}</p>
                </div>
                <div className="profile-item">
                  <label>Phone:</label>
                  <p>{adminData.phone}</p>
                </div>
                <div className="profile-item">
                  <label>Role:</label>
                  <p>{adminData.role}</p>
                </div>
                <div className="profile-item">
                  <label>Department:</label>
                  <p>{adminData.department}</p>
                </div>
                <div className="profile-item">
                  <label>Join Date:</label>
                  <p>{adminData.joinDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-edit">
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="btn-secondary" onClick={() => {
                    setIsEditingProfile(false)
                    setEditData(adminData)
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderContent = (activeTab) => {
    switch(activeTab) {
      case 'overview': return renderOverview()
      case 'students': return <StudentManagement />
      case 'subjects': return <SubjectManagement />
      case 'analytics': return renderAnalytics()
      case 'performance': return renderPerformance()
      case 'recommendations': return <AdminRecommendations />
      case 'reports': return renderReports()
      case 'settings': return renderSettings()
      default: return renderOverview()
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
