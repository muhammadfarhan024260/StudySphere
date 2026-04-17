import { useState } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login' or 'signup'
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
    <div className="app">
      {!isAuthenticated ? (
        <div>
          {currentView === 'login' && (
            <Login 
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={() => setCurrentView('signup')}
            />
          )}

          {currentView === 'signup' && (
            <Signup 
              onSignupSuccess={handleSignupSuccess}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', color: 'white' }}>
          <h1>Welcome, {userInfo?.name || 'User'}!</h1>
          <p>You are logged in successfully</p>
          <p>User ID: {userInfo?.userId}</p>
          <p>User Type: {userInfo?.userType}</p>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default App
