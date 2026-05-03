import { useState, useEffect } from 'react'
import api from '../services/api'
import './Auth.css'

export default function Signup({ initialRole = 'student', onSignupSuccess, onSwitchToLogin, onGoToHome }) {
  const [role, setRole] = useState(initialRole)
  const [step, setStep] = useState('email') // 'email', 'otp', 'password'
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpResendCountdown, setOtpResendCountdown] = useState(0)

  useEffect(() => {
    setRole(initialRole)
    setStep('email')
  }, [initialRole])

  // OTP Resend Countdown
  useEffect(() => {
    if (otpResendCountdown > 0) {
      const timer = setTimeout(() => setOtpResendCountdown(otpResendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendCountdown])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.email) {
      setError('Name and email are required')
      return
    }

    if (role === 'student' && !formData.enrollmentNumber) {
      setError('Enrollment number is required for students')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name,
        userType: role
      })

      if (response.data.success) {
        setSuccess('OTP sent to your email successfully!')
        setStep('otp')
        setOtpResendCountdown(60)
      } else {
        setError(response.data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
        userType: role
      })

      if (response.data.success) {
        setSuccess('OTP verified successfully!')
        setTimeout(() => {
          setStep('password')
        }, 500)
      } else {
        setError(response.data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

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
        setSuccess('Account created successfully! Redirecting...')
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
        localStorage.setItem('userType', response.data.userType)
        
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

  const handleResendOtp = async () => {
    setError('')
    setSuccess('')
    
    try {
      setLoading(true)
      const response = await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name,
        userType: role
      })

      if (response.data.success) {
        setSuccess('New OTP sent to your email!')
        setFormData(prev => ({ ...prev, otp: '' }))
        setOtpResendCountdown(60)
      } else {
        setError(response.data.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-brand">
        <div className="brand-inner">
          <div className="brand-mark">◈</div>
          <h1 className="brand-name">Study<br/><span>Sphere</span></h1>
          <div className="brand-rule"></div>
          <p className="brand-tagline">Begin your academic journey<br/><em>with intelligence.</em></p>
        </div>
        <div className="brand-institution">Bahria University · Academic Management</div>
        {onGoToHome && (
          <button className="brand-back-btn" onClick={onGoToHome}>← Back to home</button>
        )}
      </div>
      <div className="auth-panel">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Create account</h2>
          <p className="auth-subtitle">Join the StudySphere management platform</p>
        </div>

        <div className="role-toggle">
          <button 
            type="button" 
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => {
              setRole('student')
              setStep('email')
              setFormData({
                name: '',
                enrollmentNumber: '',
                email: '',
                password: '',
                confirmPassword: '',
                otp: '',
              })
            }}
          >
            Student
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setRole('admin')
              setStep('email')
              setFormData({
                name: '',
                enrollmentNumber: '',
                email: '',
                password: '',
                confirmPassword: '',
                otp: '',
              })
            }}
          >
            Administrator
          </button>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step === 'email' ? 'active' : step !== 'email' && (step === 'otp' || step === 'password') ? 'completed' : ''}`}>
            <span>1</span>
            <p>Email</p>
          </div>
          <div className={`step-line ${(step === 'otp' || step === 'password') ? 'active' : ''}`}></div>
          <div className={`step ${step === 'otp' ? 'active' : step === 'password' ? 'completed' : ''}`}>
            <span>2</span>
            <p>Verify OTP</p>
          </div>
          <div className={`step-line ${step === 'password' ? 'active' : ''}`}></div>
          <div className={`step ${step === 'password' ? 'active' : ''}`}>
            <span>3</span>
            <p>Password</p>
          </div>
        </div>

        {error && <div className="alert alert-error"><span>!</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✓</span> {success}</div>}

        {/* Step 1: Email & Name */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="auth-form">
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
                  placeholder="your@email.com"
                  value={formData.email}
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
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                We've sent a 6-digit code to {formData.email}
              </p>
              <div className="input-wrapper">
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setFormData(prev => ({...prev, otp: value}))
                  }}
                  maxLength="6"
                  required
                  style={{fontSize: '24px', letterSpacing: '8px', textAlign: 'center'}}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div style={{textAlign: 'center', marginTop: '12px'}}>
              {otpResendCountdown > 0 ? (
                <p style={{color: '#666', fontSize: '12px'}}>
                  Resend code in {otpResendCountdown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline'
                  }}
                >
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Password Creation */}
        {step === 'password' && (
          <form onSubmit={handleCreateAccount} className="auth-form">
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

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
    </div>
  )
}

