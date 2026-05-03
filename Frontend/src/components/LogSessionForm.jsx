import { useState } from 'react'
import { useLogSession, useSubjects } from '../hooks/useStudyData'
import './Forms.css'

export default function LogSessionForm({ onSuccess, onCancel }) {
  const { logSession, loading, error: hookError } = useLogSession()
  const { subjects, loading: subjectsLoading } = useSubjects()
  const studentId = localStorage.getItem('userId')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    subject: '',
    duration: '',
    productivityScore: 7,
    notes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'productivityScore' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.subject || !formData.duration) {
      setError('Subject and duration are required')
      return
    }

    if (formData.duration <= 0) {
      setError('Duration must be greater than 0 minutes')
      return
    }

    if (formData.productivityScore < 0 || formData.productivityScore > 10) {
      setError('Productivity score must be between 0 and 10')
      return
    }

    const sessionData = {
      studentId: parseInt(studentId),
      subjectId: parseInt(formData.subject), // Will need subject list in real implementation
      hoursStudied: formData.duration / 60, // Convert minutes to hours
      productivityScore: formData.productivityScore,
      sessionDate: new Date().toISOString(),
      notes: formData.notes
    }

    const result = await logSession(sessionData)
    if (result.success) {
      setSuccess('Study session logged successfully!')
      setFormData({ subject: '', duration: '', productivityScore: 7, notes: '' })
      setTimeout(() => onSuccess && onSuccess(), 1500)
    } else {
      setError(result.error || 'Failed to log session')
    }
  }

  return (
    <div className="form-modal-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h3>Log Study Session</h3>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {hookError && <div className="alert alert-error">{hookError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="study-form">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={subjectsLoading}
              required
            >
              <option value="">{subjectsLoading ? 'Loading...' : 'Select subject'}</option>
              {subjects.map(s => (
                <option key={s.subjectId} value={s.subjectId}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                id="duration"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                max="1440"
                placeholder="e.g., 90"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="productivity">Productivity Score</label>
              <div className="score-input">
                <input
                  id="productivity"
                  type="range"
                  name="productivityScore"
                  value={formData.productivityScore}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.5"
                />
                <span className="score-display">{formData.productivityScore}/10</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What did you focus on? Any challenges?"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging...' : 'Log Session'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
