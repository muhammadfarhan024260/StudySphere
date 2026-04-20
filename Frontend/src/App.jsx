import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login') 
  const [signupRole, setSignupRole] = useState('student')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true)
    setUserInfo(data)
    setCurrentView('dashboard')
  }

  const handleSignupSuccess = (data) => {
    // After signup, show login form
    setCurrentView('login')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserInfo(null)
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    setCurrentView('login')
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - Auth Pages */}
        <Route 
          path="/" 
          element={
            <div className="app">
              {currentView === 'login' && (
                <Login 
                  onLoginSuccess={handleLoginSuccess}
                  onSwitchToSignup={(role) => {
                    setSignupRole(role)
                    setCurrentView('signup')
                  }}
                />
              )}

              {currentView === 'signup' && (
                <Signup 
                  initialRole={signupRole}
                  onSignupSuccess={handleSignupSuccess}
                  onSwitchToLogin={() => setCurrentView('login')}
                />
              )}
            </div>
          }
        />

        {/* Dashboard Routes - Accessible without authentication for now */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

