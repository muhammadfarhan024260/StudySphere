import { useState } from 'react'
import './DashboardLayout.css'

export default function DashboardLayout({ children, userType = 'student' }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const userName = localStorage.getItem('userName') || (userType === 'admin' ? 'Admin' : 'Student')
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    // Full page reload resets App.jsx state so the user sees the home/login screen
    window.location.href = '/'
  }

  const studentTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'Study Sessions' },
    { id: 'goals', label: 'Goals' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'settings', label: 'Settings' },
  ]

  const adminTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'performance', label: 'Performance' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ]

  const tabs = userType === 'admin' ? adminTabs : studentTabs

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            {sidebarOpen && <span className="logo-text">StudySphere</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              {sidebarOpen && <span className="nav-label">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            {sidebarOpen && <span className="logout-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Top Header */}
        <header className="dashboard-top-header">
          <div className="header-left">
            <h1 className="page-title">{tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-right">
            <div className="user-section">
              <div className="user-avatar">{userInitials}</div>
              <div className="user-dropdown">
                <button className="dropdown-toggle">
                  {userName}
                  <span className="dropdown-arrow">▼</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children && typeof children === 'function' 
            ? children({ activeTab, setActiveTab })
            : children
          }
        </div>
      </main>
    </div>
  )
}
