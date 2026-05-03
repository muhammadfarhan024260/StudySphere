import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import StudentNotifications from './StudentNotifications'
import LogSessionForm from './LogSessionForm'
import CreateGoalForm from './CreateGoalForm'
import { useStudyLogs, useGoals, useWeakAreas, useNotifications, useRecommendations, useSubjects, useWeeklyReport, useStudyScope } from '../hooks/useStudyData'
import './Dashboard.css'
import './StudentDashboard.css'

export default function StudentDashboard() {
  const studentId = localStorage.getItem('userId')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  // Fetch real data from API
  const { logs, loading: logsLoading, refetch: refetchLogs } = useStudyLogs(studentId)
  const { goals, loading: goalsLoading, refetch: refetchGoals } = useGoals(studentId)
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { weakAreas } = useWeakAreas(studentId)
  const { notifications } = useNotifications(studentId)
  const { recommendations } = useRecommendations(studentId)
  const { report: weeklyReport, loading: reportLoading } = useWeeklyReport(studentId)
  const { scope: studyScope, loading: scopeLoading } = useStudyScope(studentId)

  // Student profile data - in production, this would come from API
  const [studentData] = useState({
    name: localStorage.getItem('userName') || 'Student User',
    enrollmentNumber: 'BU-21-001',
    email: localStorage.getItem('userEmail') || 'student@bahria.edu.pk',
    phone: '+92-300-1234567',
    semester: '4th Semester',
    program: 'BS Computer Science',
  })

  const [editData, setEditData] = useState(studentData)

  // Calculate statistics from real data
  const calculateStats = () => {
    const totalHours = logs.reduce((sum, log) => sum + (log.hoursStudied || 0), 0)
    const completedGoalsCount = goals.filter(g => g.status === 'Completed').length
    const activeGoalsCount = goals.filter(g => g.status === 'In Progress').length
    
    // Calculate this week's hours
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const thisWeekLogs = logs.filter(log => new Date(log.sessionDate) >= weekStart)
    const thisWeekHours = thisWeekLogs.reduce((sum, log) => sum + (log.hoursStudied || 0), 0)

    return {
      totalHours: totalHours.toFixed(1),
      thisWeekHours: thisWeekHours.toFixed(1),
      completedGoals: completedGoalsCount,
      activeGoals: activeGoalsCount,
      totalGoals: goals.length
    }
  }

  const stats = [
    { label: 'Total Hours', value: `${calculateStats().totalHours}h`, change: '+5h this week', color: '#10b981' },
    { label: 'This Week', value: `${calculateStats().thisWeekHours}h`, change: 'On track', color: '#3b82f6' },
    { label: 'Study Streak', value: logs.length > 0 ? '5 days' : 'Start now', change: 'Active', color: '#f59e0b' },
    { label: 'Goals', value: `${calculateStats().completedGoals}/${calculateStats().totalGoals}`, change: 'Completed', color: '#8b5cf6' },
  ]


  const handleSessionLogged = () => {
    setShowSessionForm(false)
    refetchLogs()
  }

  const handleGoalCreated = () => {
    setShowGoalForm(false)
    refetchGoals()
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
                <span className="progress-label">Hours This Week</span>
                <span className="progress-value">{calculateStats().thisWeekHours}/20 hours</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(parseFloat(calculateStats().thisWeekHours) / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-detail">
                {Math.round((parseFloat(calculateStats().thisWeekHours) / 20) * 100)}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="card">
          <div className="card-header">
            <h3>Active Goals</h3>
            <button className="btn-small btn-primary" onClick={() => setShowGoalForm(true)}>+ Add</button>
          </div>
          <div className="card-body">
            {goalsLoading ? (
              <p>Loading goals...</p>
            ) : goals.length === 0 ? (
              <p className="empty-state">No goals yet. Create one to get started!</p>
            ) : (
              <div className="goals-list">
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.goalId} className="goal-item">
                    <div className="goal-info">
                      <h4>{goal.title}</h4>
                      <span className="goal-meta">Target: {goal.targetHours}h</span>
                    </div>
                    <div className="goal-progress">
                      <div className="mini-bar">
                        <div className="mini-fill" style={{ width: `${Math.min(50, goal.targetHours * 5)}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card wide">
        <div className="card-header">
          <h3>Recent Study Sessions</h3>
          <button className="btn-small btn-primary" onClick={() => setShowSessionForm(true)}>+ Log Session</button>
        </div>
        <div className="card-body">
          {logsLoading ? (
            <p>Loading sessions...</p>
          ) : logs.length === 0 ? (
            <p className="empty-state">No study sessions logged yet. Start by logging your first session!</p>
          ) : (
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
                {logs.slice(0, 5).map(session => (
                  <tr key={session.logId}>
                    <td className="subject-cell">{session.subjectName || 'Subject'}</td>
                    <td>{(session.hoursStudied * 60).toFixed(0)} min</td>
                    <td>{new Date(session.sessionDate).toLocaleDateString()}</td>
                    <td>
                      <span className="productivity-badge" style={{ 
                        background: session.productivityScore >= 8 ? '#10b98122' : '#3b82f622'
                      }}>
                        ★ {session.productivityScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Weak Areas Alert */}
      {weakAreas.length > 0 && (
        <div className="card wide alert-card">
          <div className="card-header">
            <h3>⚠️ Weak Areas Detected</h3>
          </div>
          <div className="card-body">
            <p>You have {weakAreas.length} subject(s) where your average productivity is below 50%.</p>
            <div className="weak-areas-list">
              {weakAreas.map(area => (
                <div key={area.weakAreaId} className="weak-area-item">
                  <span className="subject-name">{area.subjectName}</span>
                  <span className="avg-score">Avg: {area.avgScore}%</span>
                </div>
              ))}
            </div>
            <p className="hint">Check the Notifications tab for personalized recommendations.</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderSessions = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>All Study Sessions</h3>
          <button className="btn-primary" onClick={() => setShowSessionForm(true)}>+ Log Session</button>
        </div>
        <div className="card-body">
          {logsLoading ? (
            <p>Loading sessions...</p>
          ) : logs.length === 0 ? (
            <p className="empty-state">No sessions logged yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Productivity</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(session => (
                  <tr key={session.logId}>
                    <td className="subject-cell">{session.subjectName || 'Subject'}</td>
                    <td>{(session.hoursStudied * 60).toFixed(0)} min</td>
                    <td>{new Date(session.sessionDate).toLocaleDateString()}</td>
                    <td>
                      <span className="productivity-badge">★ {session.productivityScore}</span>
                    </td>
                    <td className="notes-cell">{session.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Your Goals</h3>
          <button className="btn-primary" onClick={() => setShowGoalForm(true)}>+ Add Goal</button>
        </div>
        <div className="card-body">
          {goalsLoading ? (
            <p>Loading goals...</p>
          ) : goals.length === 0 ? (
            <p className="empty-state">No goals set yet. Create your first goal!</p>
          ) : (
            <div className="goals-list-large">
              {goals.map(goal => (
                <div key={goal.goalId} className="goal-item-large">
                  <div className="goal-left">
                    <h4>{goal.title}</h4>
                    <p className="goal-meta">Target: {goal.targetHours} hours</p>
                  </div>
                  <div className="goal-middle">
                    <div className="goal-progress-large">
                      <div className="mini-bar">
                        <div className="mini-fill" style={{ width: `50%` }}></div>
                      </div>
                      <span className="progress-text">{goal.status}</span>
                    </div>
                  </div>
                  <div className="goal-right">
                    <span className="deadline">Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSubjects = () => (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Available Subjects</h3>
        </div>
        <div className="card-body">
          {subjectsLoading ? (
            <p>Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="empty-state">No subjects available yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Target Hours</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.subjectId}>
                    <td>{subject.name}</td>
                    <td>{subject.category || '—'}</td>
                    <td>{subject.targetHours ? `${subject.targetHours}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="tab-content">
      {/* Summary stats */}
      <div className="card wide">
        <div className="card-header"><h3>Study Analytics</h3></div>
        <div className="card-body">
          <p className="info-text">Total study sessions: {logs.length}</p>
          <p className="info-text">Total hours logged: {calculateStats().totalHours}</p>
          <p className="info-text">Average productivity: {logs.length > 0 ? (logs.reduce((sum, log) => sum + log.productivityScore, 0) / logs.length).toFixed(1) : 0}/10</p>
        </div>
      </div>

      {/* Lab 9 — Weekly Report (vw_weekly_report) */}
      <div className="card wide">
        <div className="card-header"><h3>Weekly Report (by Subject)</h3></div>
        <div className="card-body">
          {reportLoading ? (
            <p>Loading weekly report...</p>
          ) : weeklyReport.length === 0 ? (
            <p className="empty-state">No weekly data yet. Log some sessions to see your report.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Subject</th>
                  <th>Sessions</th>
                  <th>Total Hours</th>
                  <th>Avg Productivity</th>
                  <th>Best Score</th>
                </tr>
              </thead>
              <tbody>
                {weeklyReport.map((row, idx) => (
                  <tr key={idx}>
                    <td>{new Date(row.weekStart).toLocaleDateString()}</td>
                    <td>{row.subjectName}</td>
                    <td>{row.sessionCount}</td>
                    <td>{row.totalHours}h</td>
                    <td>
                      <span className="productivity-badge" style={{
                        background: row.avgProductivity >= 7 ? '#10b98122' : '#f59e0b22'
                      }}>
                        ★ {row.avgProductivity}
                      </span>
                    </td>
                    <td>★ {row.maxProductivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lab 5 — Study Scope (UNION) */}
      <div className="card wide">
        <div className="card-header"><h3>Active Study Scope (last 7 days + goals)</h3></div>
        <div className="card-body">
          {scopeLoading ? (
            <p>Loading study scope...</p>
          ) : studyScope.length === 0 ? (
            <p className="empty-state">No active subjects found. Study a subject or create a goal to see your scope.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {studyScope.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.subjectName}</td>
                    <td>
                      <span className="productivity-badge" style={{
                        background: item.source === 'Studied & Has Goal' ? '#10b98122'
                          : item.source === 'Studied' ? '#3b82f622' : '#f59e0b22'
                      }}>
                        {item.source}
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

  const renderNotifications = () => <StudentNotifications />

  const renderSettings = () => (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <h3>Profile Settings</h3>
        </div>
        <div className="card-body">
          {!isEditingProfile ? (
            <div className="profile-view">
              <div className="profile-field">
                <label>Name</label>
                <p>{studentData.name}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{studentData.email}</p>
              </div>
              <div className="profile-field">
                <label>Enrollment Number</label>
                <p>{studentData.enrollmentNumber}</p>
              </div>
              <button className="btn-primary" onClick={() => setIsEditingProfile(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="profile-edit">
              <p className="info-text">Profile editing coming soon</p>
              <button className="btn-secondary" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderContent = (activeTab) => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'sessions':
        return renderSessions()
      case 'goals':
        return renderGoals()
      case 'subjects':
        return renderSubjects()
      case 'analytics':
        return renderAnalytics()
      case 'notifications':
        return renderNotifications()
      case 'settings':
        return renderSettings()
      default:
        return renderOverview()
    }
  }

  return (
    <DashboardLayout userType="student">
      {({ activeTab }) => (
        <div className="dashboard-container" key={activeTab}>
          {/* Tab Content */}
          <div className="tab-content-wrapper">
            <div className="tab-content-container">
              {renderContent(activeTab)}
            </div>
          </div>

        {/* Log Session Modal */}
        {showSessionForm && (
          <LogSessionForm
            studentId={studentId}
            onSuccess={handleSessionLogged}
            onCancel={() => setShowSessionForm(false)}
          />
        )}

        {/* Create Goal Modal */}
        {showGoalForm && (
          <CreateGoalForm
            studentId={studentId}
            onSuccess={handleGoalCreated}
            onCancel={() => setShowGoalForm(false)}
          />
        )}
      </div>
      )}
    </DashboardLayout>
  )
}
