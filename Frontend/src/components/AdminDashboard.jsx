import { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState({
    name: 'Dr. Muhammad Ali',
    email: 'admin@bahria.edu.pk',
    phone: '+92-300-9876543',
    role: 'System Administrator',
    department: 'Computer Science',
    joinDate: 'January 2025',
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editData, setEditData] = useState(adminData)

  const [stats] = useState([
    { label: 'Total Students', value: '125', change: '+8', color: '#10b981' },
    { label: 'Active This Week', value: '118', change: '94.4%', color: '#3b82f6' },
    { label: 'Total Hours', value: '2,847h', change: '+245h', color: '#f59e0b' },
    { label: 'Avg Productivity', value: '8.2/10', change: '+0.3', color: '#8b5cf6' },
  ])

  const [topPerformers] = useState([
    { rank: 1, name: 'Ahmed Hassan', enrollment: 'BU-21-001', hoursStudied: 156, goals: 8, productivity: 8.5 },
    { rank: 2, name: 'Zainab Ali', enrollment: 'BU-21-002', hoursStudied: 142, goals: 6, productivity: 8.3 },
    { rank: 3, name: 'Hassan Raza', enrollment: 'BU-21-003', hoursStudied: 138, goals: 7, productivity: 8.1 },
    { rank: 4, name: 'Amira Khan', enrollment: 'BU-21-004', hoursStudied: 125, goals: 5, productivity: 7.9 },
  ])

  const [subjectAnalytics] = useState([
    { id: 1, name: 'Data Structures', totalHours: 542, students: 45, avgProductivity: 8.4 },
    { id: 2, name: 'Database Management', totalHours: 618, students: 48, avgProductivity: 8.6 },
    { id: 3, name: 'Web Development', totalHours: 521, students: 42, avgProductivity: 8.1 },
    { id: 4, name: 'Discrete Mathematics', totalHours: 486, students: 40, avgProductivity: 7.8 },
  ])

  const [recentActivity] = useState([
    { id: 1, student: 'Ahmed Hassan', action: 'Completed goal: Master Binary Trees', time: '2 hours ago' },
    { id: 2, student: 'Zainab Ali', action: 'Logged 2.5 hours on DBMS', time: '3 hours ago' },
    { id: 3, student: 'Hassan Raza', action: 'Started new goal: API Development', time: '5 hours ago' },
    { id: 4, student: 'Amira Khan', action: 'Achieved 50+ hour milestone', time: '1 day ago' },
  ])

  const [allStudents] = useState([
    { id: 1, name: 'Ahmed Hassan', enrollment: 'BU-21-001', email: 'ahmed@bahria.edu.pk', hours: 156, goals: 8, status: 'Active' },
    { id: 2, name: 'Zainab Ali', enrollment: 'BU-21-002', email: 'zainab@bahria.edu.pk', hours: 142, goals: 6, status: 'Active' },
    { id: 3, name: 'Hassan Raza', enrollment: 'BU-21-003', email: 'hassan.r@bahria.edu.pk', hours: 138, goals: 7, status: 'Active' },
    { id: 4, name: 'Amira Khan', enrollment: 'BU-21-004', email: 'amira@bahria.edu.pk', hours: 125, goals: 5, status: 'Active' },
    { id: 5, name: 'Fatima Ahmed', enrollment: 'BU-21-005', email: 'fatima@bahria.edu.pk', hours: 98, goals: 4, status: 'Inactive' },
  ])

  const [performanceData] = useState([
    { student: 'Ahmed Hassan', ds: 92, dbms: 88, web: 85, avg: 88.3 },
    { student: 'Zainab Ali', ds: 89, dbms: 91, web: 87, avg: 89 },
    { student: 'Hassan Raza', ds: 85, dbms: 90, web: 84, avg: 86.3 },
    { student: 'Amira Khan', ds: 84, dbms: 86, web: 82, avg: 84 },
  ])

  const [analyticsData] = useState({
    weeklyStats: [
      { day: 'Mon', hours: 156, students: 110 },
      { day: 'Tue', hours: 178, students: 115 },
      { day: 'Wed', hours: 142, students: 108 },
      { day: 'Thu', hours: 195, students: 118 },
      { day: 'Fri', hours: 168, students: 105 },
      { day: 'Sat', hours: 145, students: 95 },
      { day: 'Sun', hours: 126, students: 80 },
    ],
    engagementRate: 94.4,
    avgProductivity: 8.2,
    totalSessions: 2847,
  })

  const [reportsData] = useState([
    { id: 1, title: 'Weekly Performance Report', date: '2026-04-19', type: 'Performance', status: 'Ready' },
    { id: 2, title: 'Student Engagement Analysis', date: '2026-04-18', type: 'Analytics', status: 'Ready' },
    { id: 3, title: 'Subject Breakdown Report', date: '2026-04-17', type: 'Analytics', status: 'Ready' },
    { id: 4, title: 'Monthly Productivity Summary', date: '2026-04-15', type: 'Summary', status: 'Processing' },
  ])

  const handleSaveProfile = () => {
    setAdminData(editData)
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
        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h3>Top Performers</h3>
          </div>
          <div className="card-body">
            <div className="performers-list">
              {topPerformers.map(performer => (
                <div key={performer.rank} className="performer-item">
                  <div className="rank-badge">#{performer.rank}</div>
                  <div className="performer-info">
                    <h4>{performer.name}</h4>
                    <span className="enrollment">{performer.enrollment}</span>
                  </div>
                  <div className="performer-stats">
                    <div className="mini-stat">
                      <span className="val">{performer.hoursStudied}h</span>
                      <span className="lbl">Hours</span>
                    </div>
                    <div className="mini-stat">
                      <span className="val">{performer.productivity}</span>
                      <span className="lbl">Rating</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Analytics */}
        <div className="card">
          <div className="card-header">
            <h3>Subject Analytics</h3>
          </div>
          <div className="card-body">
            <div className="subject-list">
              {subjectAnalytics.map(subject => (
                <div key={subject.id} className="subject-row">
                  <div className="subject-name">{subject.name}</div>
                  <div className="subject-stats">
                    <span className="stat-item">{subject.students} students</span>
                    <span className="stat-item">{subject.totalHours}h total</span>
                    <span className="stat-item prod">{subject.avgProductivity} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card wide">
        <div className="card-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-row">
                <div className="activity-dot"></div>
                <div className="activity-details">
                  <h4>{activity.student}</h4>
                  <p>{activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStudents = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Students Management</h3>
          <button className="btn-primary">+ Add Student</button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Enrollment</th>
                <th>Email</th>
                <th>Hours Studied</th>
                <th>Goals</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.enrollment}</td>
                  <td>{student.email}</td>
                  <td>{student.hours}h</td>
                  <td>{student.goals}</td>
                  <td>
                    <span className={`status-badge status-${student.status.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="tab-content">
      <div className="content-grid">
        <div className="card wide">
          <div className="card-header">
            <h3>Weekly Statistics</h3>
          </div>
          <div className="card-body">
            <div className="analytics-chart">
              <div className="chart-bars">
                {analyticsData.weeklyStats.map((stat, idx) => (
                  <div key={idx} className="bar-wrapper">
                    <div className="bar-label">{stat.day}</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ height: `${(stat.hours / 200) * 100}%` }}
                        title={`${stat.hours}h`}
                      ></div>
                    </div>
                    <div className="bar-value">{stat.hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>System Metrics</h3>
          </div>
          <div className="card-body">
            <div className="metrics-list">
              <div className="metric-item">
                <span className="metric-label">Engagement Rate:</span>
                <span className="metric-value">{analyticsData.engagementRate}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg Productivity:</span>
                <span className="metric-value">{analyticsData.avgProductivity}/10</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Study Sessions:</span>
                <span className="metric-value">{analyticsData.totalSessions}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Active Students:</span>
                <span className="metric-value">118</span>
              </div>
            </div>
          </div>
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

  const renderReports = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Reports</h3>
          <button className="btn-primary">+ Generate Report</button>
        </div>
        <div className="card-body">
          <div className="reports-list">
            {reportsData.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <h4>{report.title}</h4>
                  <div className="report-meta">
                    <span className="report-type">{report.type}</span>
                    <span className="report-date">{report.date}</span>
                  </div>
                </div>
                <div className="report-status">
                  <span className={`status-badge status-${report.status.toLowerCase()}`}>
                    {report.status}
                  </span>
                </div>
                <button className="btn-small">Download</button>
              </div>
            ))}
          </div>
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
      case 'students': return renderStudents()
      case 'analytics': return renderAnalytics()
      case 'performance': return renderPerformance()
      case 'reports': return renderReports()
      case 'settings': return renderSettings()
      default: return renderOverview()
    }
  }

  return (
    <DashboardLayout userType="admin">
      {({ activeTab }) => (
        <div className="admin-dashboard" key={activeTab}>
          {renderContent(activeTab)}
        </div>
      )}
    </DashboardLayout>
  )
}
