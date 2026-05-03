import { useState } from 'react'
import { useCreateGoal, useSubjects } from '../hooks/useStudyData'
import './Forms.css'

export default function CreateGoalForm({ onSuccess, onCancel }) {
  const { createGoal, loading, error: hookError } = useCreateGoal()
  const { subjects, loading: subjectsLoading } = useSubjects()
  const studentId = localStorage.getItem('userId')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    subject: '',
    goalType: 'weekly',
    targetHours: '',
    deadline: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetHours' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.subject || !formData.targetHours || !formData.deadline) {
      setError('Subject, target hours, and deadline are required')
      return
    }

    if (formData.targetHours <= 0) {
      setError('Target hours must be greater than 0')
      return
    }

    const deadlineDate = new Date(formData.deadline)
    if (deadlineDate < new Date()) {
      setError('Deadline must be in the future')
      return
    }

    const goalData = {
      studentId: parseInt(studentId),
      subjectId: parseInt(formData.subject),
      goalType: formData.goalType,
      targetHours: formData.targetHours,
      deadline: deadlineDate.toISOString(),
    }

    const result = await createGoal(goalData)
    if (result.success) {
      setSuccess('Study goal created successfully!')
      setFormData({ subject: '', goalType: 'weekly', targetHours: '', deadline: '' })
      setTimeout(() => onSuccess && onSuccess(), 1500)
    } else {
      setError(result.error || 'Failed to create goal')
    }
  }

  return (
    <div className="form-modal-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h3>Create Study Goal</h3>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {hookError && <div className="alert alert-error">{hookError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="study-form">
          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="goalType">Goal Type *</label>
              <select
                id="goalType"
                name="goalType"
                value={formData.goalType}
                onChange={handleChange}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetHours">Target Hours *</label>
              <input
                id="targetHours"
                type="number"
                name="targetHours"
                value={formData.targetHours}
                onChange={handleChange}
                step="0.5"
                min="0.5"
                placeholder="e.g., 20"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline *</label>
              <input
                id="deadline"
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
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
