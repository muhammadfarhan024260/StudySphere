import { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import './StudentDashboard.css'

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState({
    name: 'Ahmed Hassan',
    enrollmentNumber: 'BU-21-001',
    email: 'ahmed.hassan@bahria.edu.pk',
    phone: '+92-300-1234567',
    semester: '4th Semester',
    program: 'BS Computer Science',
    totalHoursStudied: 156,
    weekHoursTarget: 20,
    currentWeekHours: 14,
    streakDays: 12,
    completedGoals: 8,
    activeGoals: 3,
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editData, setEditData] = useState(studentData)

  const [stats] = useState([
    { label: 'Total Hours', value: '156h', change: '+12h', color: '#10b981' },
    { label: 'This Week', value: '14/20h', change: '70%', color: '#3b82f6' },
    { label: 'Study Streak', value: '12 days', change: 'Active', color: '#f59e0b' },
    { label: 'Goals Completed', value: '8/11', change: '+2 this month', color: '#8b5cf6' },
  ])

  const [recentSessions] = useState([
    { id: 1, subject: 'Data Structures', duration: 90, date: '2026-04-19', productivity: 8.5 },
    { id: 2, subject: 'Database Management', duration: 120, date: '2026-04-18', productivity: 9.0 },
    { id: 3, subject: 'Web Development', duration: 60, date: '2026-04-17', productivity: 7.5 },
    { id: 4, subject: 'Discrete Mathematics', duration: 75, date: '2026-04-16', productivity: 8.2 },
    { id: 5, subject: 'Data Structures', duration: 100, date: '2026-04-15', productivity: 8.8 },
  ])

  const [goals] = useState([
    { id: 1, title: 'Master Binary Trees', subject: 'Data Structures', deadline: 'May 5, 2026', progress: 65 },
    { id: 2, title: 'Complete SQL Queries', subject: 'DBMS', deadline: 'May 10, 2026', progress: 80 },
    { id: 3, title: 'Build REST API', subject: 'Web Development', deadline: 'May 15, 2026', progress: 45 },
  ])

  const [subjects] = useState([
    { id: 1, name: 'Data Structures', hours: 52, sessions: 18, avgProductivity: 8.5, status: 'Active' },
    { id: 2, name: 'Database Management', hours: 48, sessions: 16, avgProductivity: 8.7, status: 'Active' },
    { id: 3, name: 'Web Development', hours: 38, sessions: 12, avgProductivity: 8.1, status: 'Active' },
    { id: 4, name: 'Discrete Mathematics', hours: 18, sessions: 8, avgProductivity: 8.0, status: 'In Progress' },
  ])

  const [analyticsData] = useState({
    weeklyHours: [12, 15, 18, 14, 20, 16, 14],
    dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    subjectBreakdown: [
      { name: 'Data Structures', hours: 52, percentage: 33 },
      { name: 'DBMS', hours: 48, percentage: 31 },
      { name: 'Web Dev', hours: 38, percentage: 24 },
      { name: 'Discrete Math', hours: 18, percentage: 12 },
    ],
    monthlyGrowth: [120, 128, 132, 140, 148, 156],
    months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  })

  const handleSaveProfile = () => {
    setStudentData(editData)
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
        {/* Weekly Progress */}
        <div className="card wide">
          <div className="card-header">
            <h3>Weekly Progress</h3>
          </div>
          <div className="card-body">
            <div className="progress-section">
              <div className="progress-info">
                <span className="progress-label">Week Target</span>
                <span className="progress-value">{studentData.currentWeekHours}/{studentData.weekHoursTarget} hours</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(studentData.currentWeekHours / studentData.weekHoursTarget) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-detail">
                {Math.round((studentData.currentWeekHours / studentData.weekHoursTarget) * 100)}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="card">
          <div className="card-header">
            <h3>Active Goals</h3>
          </div>
          <div className="card-body">
            <div className="goals-list">
              {goals.map(goal => (
                <div key={goal.id} className="goal-item">
                  <div className="goal-info">
                    <h4>{goal.title}</h4>
                    <span className="goal-meta">{goal.subject} • {goal.deadline}</span>
                  </div>
                  <div className="goal-progress">
                    <div className="mini-bar">
                      <div className="mini-fill" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                    <span className="progress-text">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card wide">
        <div className="card-header">
          <h3>Recent Study Sessions</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Duration</th>
                <th>Date</th>
                <th>Productivity</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map(session => (
                <tr key={session.id}>
                  <td className="subject-cell">{session.subject}</td>
                  <td>{session.duration} min</td>
                  <td>{session.date}</td>
                  <td>
                    <span className="productivity-badge" style={{ 
                      background: session.productivity >= 8.5 ? '#10b98122' : '#3b82f622'
                    }}>
                      ★ {session.productivity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSessions = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>All Study Sessions</h3>
          <button className="btn-primary">+ Log Session</button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Duration</th>
                <th>Date</th>
                <th>Productivity</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map(session => (
                <tr key={session.id}>
                  <td className="subject-cell">{session.subject}</td>
                  <td>{session.duration} min</td>
                  <td>{session.date}</td>
                  <td>
                    <span className="productivity-badge">★ {session.productivity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Your Goals</h3>
          <button className="btn-primary">+ Add Goal</button>
        </div>
        <div className="card-body">
          <div className="goals-list">
            {goals.map(goal => (
              <div key={goal.id} className="goal-item-large">
                <div className="goal-left">
                  <h4>{goal.title}</h4>
                  <p className="goal-meta">{goal.subject}</p>
                </div>
                <div className="goal-middle">
                  <div className="goal-progress-large">
                    <div className="mini-bar">
                      <div className="mini-fill" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                    <span className="progress-text">{goal.progress}%</span>
                  </div>
                </div>
                <div className="goal-right">
                  <span className="deadline">Due: {goal.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="tab-content">
      <div className="content-grid">
        {/* Weekly Hours */}
        <div className="card wide">
          <div className="card-header">
            <h3>Weekly Study Hours</h3>
          </div>
          <div className="card-body">
            <div className="analytics-chart">
              <div className="chart-bars">
                {analyticsData.weeklyHours.map((hours, idx) => (
                  <div key={idx} className="bar-wrapper">
                    <div className="bar-label">{analyticsData.dayLabels[idx]}</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ height: `${(hours / 20) * 100}%` }}
                        title={`${hours}h`}
                      ></div>
                    </div>
                    <div className="bar-value">{hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="card">
          <div className="card-header">
            <h3>Subject Time Distribution</h3>
          </div>
          <div className="card-body">
            <div className="subject-breakdown">
              {analyticsData.subjectBreakdown.map((subject, idx) => (
                <div key={idx} className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="subject-name">{subject.name}</span>
                    <span className="subject-hours">{subject.hours}h</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill" 
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <div className="breakdown-percent">{subject.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="card">
          <div className="card-header">
            <h3>Total Hours Growth</h3>
          </div>
          <div className="card-body">
            <div className="growth-chart">
              {analyticsData.monthlyGrowth.map((hours, idx) => (
                <div key={idx} className="growth-point">
                  <div className="month-label">{analyticsData.months[idx]}</div>
                  <div className="growth-bar" style={{ height: `${(hours / 160) * 100}%` }}>
                    <span className="growth-value">{hours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSubjects = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>My Subjects</h3>
        </div>
        <div className="card-body">
          <div className="subjects-list">
            {subjects.map(subject => (
              <div key={subject.id} className="subject-card">
                <div className="subject-header">
                  <h4>{subject.name}</h4>
                  <span className={`status-badge status-${subject.status.toLowerCase().replace(' ', '-')}`}>
                    {subject.status}
                  </span>
                </div>
                <div className="subject-details">
                  <div className="detail-item">
                    <span className="detail-label">Total Hours:</span>
                    <span className="detail-value">{subject.hours} hours</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Sessions:</span>
                    <span className="detail-value">{subject.sessions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Avg Productivity:</span>
                    <span className="detail-value">{subject.avgProductivity}/10</span>
                  </div>
                </div>
                <div className="subject-actions">
                  <button className="btn-small">View Details</button>
                  <button className="btn-small">Log Session</button>
                </div>
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
          <h3>Profile Settings</h3>
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
                <div className="profile-avatar">{studentData.name.substring(0, 2).toUpperCase()}</div>
                <div className="profile-header-info">
                  <h2>{studentData.name}</h2>
                  <p className="enrollment">{studentData.enrollmentNumber}</p>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <label>Email:</label>
                  <p>{studentData.email}</p>
                </div>
                <div className="profile-item">
                  <label>Phone:</label>
                  <p>{studentData.phone}</p>
                </div>
                <div className="profile-item">
                  <label>Semester:</label>
                  <p>{studentData.semester}</p>
                </div>
                <div className="profile-item">
                  <label>Program:</label>
                  <p>{studentData.program}</p>
                </div>
                <div className="profile-item">
                  <label>Total Hours Studied:</label>
                  <p>{studentData.totalHoursStudied} hours</p>
                </div>
                <div className="profile-item">
                  <label>Study Streak:</label>
                  <p>{studentData.streakDays} days</p>
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
                    setEditData(studentData)
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
      case 'sessions': return renderSessions()
      case 'goals': return renderGoals()
      case 'analytics': return renderAnalytics()
      case 'subjects': return renderSubjects()
      case 'settings': return renderSettings()
      default: return renderOverview()
    }
  }

  return (
    <DashboardLayout userType="student">
      {({ activeTab }) => (
        <div className="student-dashboard" key={activeTab}>
          {renderContent(activeTab)}
        </div>
      )}
    </DashboardLayout>
  )
}

function renderContent(activeTab) {
  return { renderContent };
}
