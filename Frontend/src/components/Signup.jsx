import { useState, useEffect } from 'react'
import api from '../services/api'
import { useDepartments, useSemesters } from '../hooks/useStudyData'
import CustomSelect from './CustomSelect'
import OtpInput from './OtpInput'
import AuthNav from './AuthNav'
import './Auth.css'



export default function Signup({ onSignupSuccess, onSwitchToLogin, onGoToHome }) {
  const { departments, loading: deptLoading } = useDepartments()
  const { semesters,   loading: semLoading  } = useSemesters()
  const role = 'student'
  const [step, setStep] = useState('email') // 'email', 'otp', 'password'
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    phone: '+92-',
    department: '',
    semester: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpResendCountdown, setOtpResendCountdown] = useState(0)

  useEffect(() => {
    setStep('email')
  }, [])

  // OTP Resend Countdown
  useEffect(() => {
    if (otpResendCountdown > 0) {
      const timer = setTimeout(() => setOtpResendCountdown(otpResendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendCountdown])

  const handleChange = (e) => {
    let { name, value } = e.target

    if (name === 'phone') {
      // Ensure prefix +92- is always present
      if (!value.startsWith('+92-')) {
        const rawDigits = value.replace(/\D/g, '');
        const digitsOnly = rawDigits.startsWith('92') ? rawDigits.slice(2) : rawDigits;
        value = '+92-' + digitsOnly;
      }

      // Extract only digits after +92-
      const digits = value.slice(4).replace(/\D/g, '').slice(0, 10);
      
      // Reformat with dashes: +92-XXX-XXXXXXX
      let formatted = '+92-';
      if (digits.length > 0) {
        formatted += digits.slice(0, 3);
      }
      if (digits.length > 3) {
        formatted += '-' + digits.slice(3);
      }
      value = formatted;
    }

    if (name === 'enrollmentNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      let formatted = '';
      if (digits.length > 0) {
        formatted += digits.slice(0, 2);
      }
      if (digits.length > 2) {
        formatted += '-' + digits.slice(2, 8);
      }
      if (digits.length > 8) {
        formatted += '-' + digits.slice(8);
      }
      value = formatted;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email) {
      setError('Name and email are required')
      return
    }

    if (role === 'student') {
      if (!formData.enrollmentNumber) {
        setError('Enrollment number is required')
        return
      }
      if (!/^\d{2}-\d{6}-\d{3}$/.test(formData.enrollmentNumber)) {
        setError('Enrollment number must be in the format XX-XXXXXX-XXX (e.g. 02-131242-038)')
        return
      }
      if (!formData.phone || formData.phone === '+92-') {
        setError('Phone number is required')
        return
      }
      if (!/^\+92-\d{3}-\d{7}$/.test(formData.phone)) {
        setError('Phone number must be in the format +92-XXX-XXXXXXX')
        return
      }
      if (!formData.department) {
        setError('Department is required')
        return
      }
      if (!formData.semester) {
        setError('Semester is required')
        return
      }
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name,
        userType: role
      })

      if (response.data.success) {
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
        userType: role,
        enrollmentNumber: formData.enrollmentNumber,
        phone: formData.phone,
        department: formData.department,
        semester: formData.semester,
      }

      const response = await api.post('/auth/signup', signupData)

      if (response.data.success) {
        const d = response.data
        localStorage.setItem('token', d.token)
        localStorage.setItem('userId', d.userId)
        localStorage.setItem('userType', d.userType)
        if (d.name)             localStorage.setItem('userName',       d.name)
        if (d.email)            localStorage.setItem('userEmail',      d.email)
        if (d.enrollmentNumber) localStorage.setItem('userEnrollment', d.enrollmentNumber)
        if (d.phone)            localStorage.setItem('userPhone',      d.phone)
        if (d.department)       localStorage.setItem('userDepartment', d.department)
        if (d.semester)         localStorage.setItem('userSemester',   d.semester)

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
    
    try {
      setLoading(true)
      const response = await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name,
        userType: role
      })

      if (response.data.success) {
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
      <AuthNav onBack={onGoToHome} />
      <div className="auth-panel">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Create account</h2>
          <p className="auth-subtitle">Join the StudySphere management platform</p>
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
                    placeholder="e.g. 02-131242-038"
                    value={formData.enrollmentNumber}
                    onChange={handleChange}
                    maxLength="13"
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

            {role === 'student' && (
              <>
                <div className="auth-form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <CustomSelect
                      options={departments.map(d => ({ value: d.name, label: d.name }))}
                      value={formData.department}
                      onChange={val => setFormData(prev => ({ ...prev, department: val }))}
                      placeholder="Select department"
                      loading={deptLoading}
                      theme="green"
                      icon={null}
                    />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <CustomSelect
                      options={semesters.map(s => ({ value: s.name, label: s.name }))}
                      value={formData.semester}
                      onChange={val => setFormData(prev => ({ ...prev, semester: val }))}
                      placeholder="Select semester"
                      loading={semLoading}
                      theme="blue"
                      icon={null}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrapper">
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+92-300-0000000"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="15"
                      required
                    />
                  </div>
                </div>
              </>
            )}

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
                <OtpInput
                  value={formData.otp}
                  onChange={(val) => setFormData(prev => ({...prev, otp: val}))}
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

