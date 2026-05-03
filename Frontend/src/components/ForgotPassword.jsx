import { useState } from 'react'
import api from '../services/api'
import './Auth.css'

export default function ForgotPassword({ onBack, initialRole = 'student' }) {
  const [step, setStep] = useState(1) // 1=email, 2=otp+password
  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Email is required'); return }

    try {
      setLoading(true)
      const res = await api.post('/auth/forgot-password', { email, userType: role })
      if (res.data.success) {
        setStep(2)
        setSuccess('A 6-digit reset code has been sent to your email.')
      } else {
        setError(res.data.message || 'Failed to send reset code')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!otp || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/auth/reset-password', {
        email,
        userType: role,
        otp,
        newPassword
      })
      if (res.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...')
        setTimeout(() => onBack(), 2000)
      } else {
        setError(res.data.message || 'Reset failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-brand">
        <div className="brand-inner">
          <div className="brand-mark">◈</div>
          <h1 className="brand-name">Study<br /><span>Sphere</span></h1>
          <div className="brand-rule"></div>
          <p className="brand-tagline">Reset your password<br /><em>securely via email.</em></p>
        </div>
        <div className="brand-institution">Bahria University · Academic Management</div>
        <button className="brand-back-btn" onClick={onBack}>← Back to login</button>
      </div>

      <div className="auth-panel">
        <div className="auth-box">
          <div className="auth-header">
            <h2>Reset Password</h2>
            <p className="auth-subtitle">
              {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code sent to your email'}
            </p>
          </div>

          {step === 1 && (
            <>
              <div className="role-toggle">
                <button type="button" className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
                <button type="button" className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>Administrator</button>
              </div>

              {error && <div className="alert alert-error"><span>!</span> {error}</div>}
              {success && <div className="alert alert-success"><span>✓</span> {success}</div>}

              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="form-group">
                  <label htmlFor="fp-email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      id="fp-email"
                      type="email"
                      placeholder="registered@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="auth-button">
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              {error && <div className="alert alert-error"><span>!</span> {error}</div>}
              {success && <div className="alert alert-success"><span>✓</span> {success}</div>}

              <form onSubmit={handleReset} className="auth-form">
                <div className="form-group">
                  <label htmlFor="fp-otp">Reset Code (6 digits)</label>
                  <div className="input-wrapper">
                    <input
                      id="fp-otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="fp-pw">New Password</label>
                  <div className="input-wrapper">
                    <input
                      id="fp-pw"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="fp-pw2">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="fp-pw2"
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="auth-button">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="auth-footer">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setStep(1); setError(''); setSuccess('') }}
                >
                  Resend code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
