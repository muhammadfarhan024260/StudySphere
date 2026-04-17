import { useState, useEffect } from 'react'
import api from '../services/api'
import './Auth.css'

export default function Signup({ initialRole = 'student', onSignupSuccess, onSwitchToLogin }) {
  const [role, setRole] = useState(initialRole)
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

  useEffect(() => {
    setRole(initialRole)
  }, [initialRole])

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

    if (!formData.name || !formData.email || !formData.password) {
      setError('All required fields must be completed')
      return
    }

    if (role === 'student' && !formData.enrollmentNumber) {
      setError('Enrollment number is required for students')
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

    try {
      setLoading(true)
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: role
      }

      if (role === 'student') {
        signupData.enrollmentNumber = formData.enrollmentNumber
      }

      const response = await api.post('/auth/signup', signupData)

      if (response.data.success) {
        setSuccess('Account created successfully!')
        setTimeout(() => {
          onSignupSuccess && onSignupSuccess(response.data)
        }, 1500)
      } else {
        setError(response.data.message || 'Signup failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Create {role === 'student' ? 'Student' : 'Admin'} Account</h2>
          <p className="auth-subtitle">Join the StudySphere management platform</p>
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
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label htmlFor="enrollmentNumber">Enrollment Number</label>
              <div className="input-wrapper">
                <input
                  id="enrollmentNumber"
                  type="text"
                  name="enrollmentNumber"
                  placeholder="e.g. BU-21-001"
                  value={formData.enrollmentNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                name="email"
                placeholder="registered@email.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating...' : 'Register Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already registered?</span>
        </div>

        <button 
          type="button"
          onClick={onSwitchToLogin}
          className="switch-auth-btn"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
