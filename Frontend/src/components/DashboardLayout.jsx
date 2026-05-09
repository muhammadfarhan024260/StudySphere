import { useState, useRef, useEffect } from 'react'
import './DashboardLayout.css'
import ThemeToggle from './ThemeToggle'

/* ── Tab icon SVGs ─────────────────────────────────────── */
const Icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  sessions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  goals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  subjects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  performance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  recommendations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

export default function DashboardLayout({ children, userType = 'student', displayName, onTabChange }) {
  const [activeTab,    setActiveTab]    = useState('overview')

  const changeTab = (tab) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }
  const [sidebarOpen,  setSidebarOpen]  = useState(() => window.innerWidth > 768)
  const [isMobile,     setIsMobile]     = useState(() => window.innerWidth <= 768)
  const [tooltip,      setTooltip]      = useState({ label: '', y: 0, visible: false })
  const [profileOpen,  setProfileOpen]  = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (isMobile && sidebarOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobile, sidebarOpen])

  // displayName prop keeps header in sync when user edits profile in settings tab
  const userName     = displayName || localStorage.getItem('userName') || (userType === 'admin' ? 'Admin' : 'Student')
  const userEmail    = localStorage.getItem('userEmail') || ''
  const userInitials = userName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const userRole     = userType === 'admin' ? 'Administrator' : 'Student'

  // close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [profileOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    window.location.href = '/'
  }

  const studentTabs = [
    { id: 'overview',       label: 'Overview' },
    { id: 'sessions',       label: 'Study Sessions' },
    { id: 'goals',          label: 'Goals' },
    { id: 'analytics',      label: 'Analytics' },
    { id: 'subjects',       label: 'Subjects' },
    { id: 'notifications',  label: 'Notifications' },
    { id: 'settings',       label: 'Settings' },
  ]

  const adminTabs = [
    { id: 'overview',        label: 'Overview' },
    { id: 'students',        label: 'Students' },
    { id: 'subjects',        label: 'Subjects' },
    { id: 'analytics',       label: 'Analytics' },
    { id: 'performance',     label: 'Performance' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'reports',         label: 'Reports' },
    { id: 'settings',        label: 'Settings' },
  ]

  const tabs = userType === 'admin' ? adminTabs : studentTabs

  const showTooltip = (label, e) => {
    if (sidebarOpen) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, y: rect.top + rect.height / 2, visible: true })
  }
  const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }))

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={!sidebarOpen ? () => setSidebarOpen(true) : undefined}
               style={!sidebarOpen ? { cursor: 'pointer' } : undefined}>
            <img src="/icon.png" alt="StudySphere" className="logo-img" />
            {sidebarOpen && <span className="logo-text">StudySphere</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              {sidebarOpen
                ? <polyline points="15 18 9 12 15 6"/>
                : <polyline points="9 18 15 12 9 6"/>}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { changeTab(tab.id); if (isMobile) setSidebarOpen(false) }}
              onMouseEnter={e => showTooltip(tab.label, e)}
              onMouseLeave={hideTooltip}
            >
              <span className="nav-icon">
                {Icons[tab.id] || Icons.overview}
              </span>
              {sidebarOpen && <span className="nav-label">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            onMouseEnter={e => showTooltip('Logout', e)}
            onMouseLeave={hideTooltip}
            aria-label="Logout"
          >
            <span className="nav-icon">{Icons.logout}</span>
            {sidebarOpen && <span className="logout-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Fixed tooltip — rendered outside sidebar so it isn't clipped */}
      {tooltip.visible && !sidebarOpen && (
        <div
          className="nav-tooltip-fixed"
          style={{ top: tooltip.y }}
          onMouseEnter={hideTooltip}
        >
          {tooltip.label}
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Top Header */}
        <header className="dashboard-top-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                {sidebarOpen && isMobile
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
            <h1 className="page-title">{tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-right">
            <ThemeToggle />
            <div className="user-section" ref={profileRef}>
              <button
                className={`hdr-profile-btn${profileOpen ? ' open' : ''}`}
                onClick={() => setProfileOpen(v => !v)}
                aria-label="Open profile menu"
              >
                <div className="hdr-avatar">{userInitials}</div>
                <span className="hdr-name">{userName}</span>
                <svg className={`hdr-chevron${profileOpen ? ' open' : ''}`}
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {profileOpen && (
                <div className="hdr-dropdown">
                  {/* Profile card */}
                  <div className="hdr-dd-card">
                    <div className="hdr-dd-avatar">{userInitials}</div>
                    <div className="hdr-dd-info">
                      <span className="hdr-dd-name">{userName}</span>
                      {userEmail && <span className="hdr-dd-email">{userEmail}</span>}
                      <span className="hdr-dd-role">{userRole}</span>
                    </div>
                  </div>

                  <div className="hdr-dd-divider" />

                  {/* Settings link */}
                  <button
                    className="hdr-dd-item"
                    onClick={() => { changeTab('settings'); setProfileOpen(false) }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Profile &amp; Settings
                  </button>

                  <div className="hdr-dd-divider" />

                  {/* Logout */}
                  <button className="hdr-dd-item hdr-dd-logout" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children && typeof children === 'function'
            ? children({ activeTab, setActiveTab: changeTab })
            : children}
        </div>
      </main>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
