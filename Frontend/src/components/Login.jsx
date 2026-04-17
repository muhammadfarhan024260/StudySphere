import { useState } from 'react'
import api from '../services/api'
import './Auth.css'

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student') // 'student' or 'admin'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/login', {
        email,
        password,
        userType: role
      })

      if (response.data.success) {
        setSuccess(`Login successful. Redirecting...`)
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
        localStorage.setItem('userType', response.data.userType)
        
        setTimeout(() => {
          onLoginSuccess && onLoginSuccess(response.data)
        }, 1500)
      } else {
        setError(response.data.message || 'Verification failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>StudySphere</h2>
          <p className="auth-subtitle">Welcome to your academic management portal</p>
        </div>

        <div className="role-toggle">
          <button 
            type="button" 
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Administrator
          </button>
        </div>

        {error && <div className="alert alert-error"><span>!</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✓</span> {success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="registered@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Processing...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <div className="auth-footer">
          <a href="#forgot">Forgot password?</a>
        </div>

        <div className="auth-divider">
          <span>New account?</span>
        </div>

        <button 
          type="button"
          onClick={() => onSwitchToSignup(role)}
          className="switch-auth-btn"
        >
          Create {role === 'student' ? 'Student' : 'Admin'} Account
        </button>
      </div>
    </div>
  )
}
