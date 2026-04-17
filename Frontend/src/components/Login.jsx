import { useState } from 'react'
import api from '../services/api'
import './Auth.css'

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      if (response.data.success) {
        setSuccess('Login successful! Redirecting...')
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
        localStorage.setItem('userType', response.data.userType)
        
        setTimeout(() => {
          onLoginSuccess && onLoginSuccess(response.data)
        }, 1500)
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Student Login</h2>
        <p className="auth-subtitle">Sign in to your StudySphere account</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="#forgot">Forgot password?</a>
        </div>

        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        <button 
          type="button"
          onClick={onSwitchToSignup}
          className="signup-button"
        >
          Create New Account
        </button>
      </div>
    </div>
  )
}
