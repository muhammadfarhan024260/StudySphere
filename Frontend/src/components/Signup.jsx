import { useState } from 'react'
import api from '../services/api'
import './Auth.css'

export default function Signup({ onSignupSuccess, onSwitchToLogin, role, setRole }) {
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

    // Validate based on role
    const isStudent = role === 'student';
    if (!formData.name || (isStudent && !formData.enrollmentNumber) || !formData.email || !formData.password) {
      setError('Enter all details')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/signup', {
        name: formData.name,
        enrollmentNumber: isStudent ? formData.enrollmentNumber : null,
        email: formData.email,
        password: formData.password,
        userType: role
      })

      if (response.data.success) {
        setSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} account created! Preparing login...`)
        setTimeout(() => {
          onSignupSuccess && onSignupSuccess(response.data)
        }, 2000)
      } else {
        setError(response.data.message || 'Signup failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>{role === 'student' ? "Student Registration" : "Admin Registration"}</h2>
          <p className="auth-subtitle">Initialize your profile in our academic ecosystem</p>
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

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✓</span> {success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label htmlFor="enrollmentNumber">Enrollment ID</label>
              <div className="input-wrapper">
                <input
                  id="enrollmentNumber"
                  type="text"
                  name="enrollmentNumber"
                  placeholder="BU-XX-XXX"
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
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Access Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create secure password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Verify Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
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
            {loading ? 'Initializing...' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <button 
          type="button"
          onClick={onSwitchToLogin}
          className="switch-auth-btn"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}
