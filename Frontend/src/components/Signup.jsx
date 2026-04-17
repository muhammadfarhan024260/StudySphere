import { useState } from 'react'
import api from '../services/api'
import './Auth.css'

export default function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.enrollmentNumber || !formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Enrollment number format check (optional)
    if (!/^BU-\d{2}-\d{3}$/.test(formData.enrollmentNumber)) {
      setError('Enrollment number format: BU-XX-XXX (e.g., BU-21-001)')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/signup', {
        name: formData.name,
        enrollmentNumber: formData.enrollmentNumber,
        email: formData.email,
        password: formData.password,
      })

      if (response.data.success) {
        setSuccess('Signup successful! Please log in.')
        setFormData({
          name: '',
          enrollmentNumber: '',
          email: '',
          password: '',
          confirmPassword: '',
        })
        
        setTimeout(() => {
          onSignupSuccess && onSignupSuccess(response.data)
        }, 2000)
      } else {
        setError(response.data.message || 'Signup failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join StudySphere today</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="enrollmentNumber">Enrollment Number</label>
            <input
              id="enrollmentNumber"
              type="text"
              name="enrollmentNumber"
              placeholder="BU-21-001"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              required
            />
            <small>Format: BU-XX-XXX</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@bahria.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <small>At least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <button 
          type="button"
          onClick={onSwitchToLogin}
          className="signup-button"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}
