import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DashboardLayout.css'

export default function DashboardLayout({ children, userType = 'student' }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    navigate('/')
  }

  const studentTabs = [
    { id: 'overview', label: 'Overview', icon: '▦' },
    { id: 'sessions', label: 'Study Sessions', icon: '⊞' },
    { id: 'goals', label: 'Goals', icon: '◆' },
    { id: 'analytics', label: 'Analytics', icon: '▲' },
    { id: 'subjects', label: 'Subjects', icon: '≡' },
    { id: 'notifications', label: 'Notifications', icon: '◔' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ]

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: '▦' },
    { id: 'students', label: 'Students', icon: '◎' },
    { id: 'analytics', label: 'Analytics', icon: '▲' },
    { id: 'performance', label: 'Performance', icon: '★' },
    { id: 'recommendations', label: 'Recommendations', icon: '✎' },
    { id: 'reports', label: 'Reports', icon: '▬' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ]

  const tabs = userType === 'admin' ? adminTabs : studentTabs

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">▨</span>
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
              <span className="nav-icon">{tab.icon}</span>
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
            <span className="logout-icon">⇨</span>
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
              <div className="user-avatar">AH</div>
              <div className="user-dropdown">
                <button className="dropdown-toggle">
                  Ahmed Hassan
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
