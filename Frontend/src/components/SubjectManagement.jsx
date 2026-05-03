import { useState, useEffect } from 'react'
import api from '../services/api'
import './Dashboard.css'

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    targetHours: ''
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const res = await api.get('/subject')
      if (res.data.success) {
        setSubjects(res.data.subjects)
      } else {
        setError(res.data.message || 'Failed to fetch subjects')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        targetHours: formData.targetHours ? parseFloat(formData.targetHours) : null
      }
      const res = await api.post('/subject', payload)
      if (res.data.success) {
        setIsAdding(false)
        setFormData({ name: '', category: '', targetHours: '' })
        fetchSubjects()
      } else {
        setError(res.data.message || 'Failed to add subject')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subject')
    }
  }

  const handleEditSubmit = async (e, id) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        subjectId: id,
        name: formData.name,
        category: formData.category,
        targetHours: formData.targetHours ? parseFloat(formData.targetHours) : null
      }
      const res = await api.put(`/subject/${id}`, payload)
      if (res.data.success) {
        setEditingId(null)
        setFormData({ name: '', category: '', targetHours: '' })
        fetchSubjects()
      } else {
        setError(res.data.message || 'Failed to update subject')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update subject')
    }
  }

  const startEditing = (subject) => {
    setEditingId(subject.subjectId)
    setFormData({
      name: subject.name,
      category: subject.category || '',
      targetHours: subject.targetHours || ''
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return
    try {
      const res = await api.delete(`/subject/${id}`)
      if (res.data.success) {
        fetchSubjects()
      } else {
        setError(res.data.message || 'Failed to delete subject')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject')
    }
  }

  if (loading && subjects.length === 0) {
    return <div className="tab-content"><p>Loading subjects...</p></div>
  }

  return (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Subject Management</h3>
          {!isAdding && (
            <button className="btn-primary" onClick={() => {
              setIsAdding(true)
              setEditingId(null)
              setFormData({ name: '', category: '', targetHours: '' })
            }}>
              + Add Subject
            </button>
          )}
        </div>
        
        <div className="card-body">
          {error && <div className="alert alert-error"><span>!</span> {error}</div>}
          
          {isAdding && (
            <div className="edit-form" style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h4>Add New Subject</h4>
              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label>Subject Name*</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Computer Science" />
                </div>
                <div className="form-group">
                  <label>Target Hours</label>
                  <input type="number" step="0.1" name="targetHours" value={formData.targetHours} onChange={handleInputChange} placeholder="e.g. 40" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Add</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {subjects.length === 0 && !isAdding ? (
            <p className="empty-state">No subjects found. Add one to get started.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Target Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.subjectId}>
                    {editingId === subject.subjectId ? (
                      <td colSpan="5">
                        <form onSubmit={(e) => handleEditSubmit(e, subject.subjectId)} className="inline-edit-form">
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ flex: 1 }} />
                          <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" style={{ flex: 1 }} />
                          <input type="number" step="0.1" name="targetHours" value={formData.targetHours} onChange={handleInputChange} placeholder="Target Hours" style={{ width: '100px' }} />
                          <button type="submit" className="btn-primary btn-small">Save</button>
                          <button type="button" className="btn-secondary btn-small" onClick={() => setEditingId(null)}>Cancel</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td>{subject.subjectId}</td>
                        <td><strong>{subject.name}</strong></td>
                        <td>{subject.category || '-'}</td>
                        <td>{subject.targetHours ? `${subject.targetHours}h` : '-'}</td>
                        <td>
                          <button className="btn-small" style={{ marginRight: '8px' }} onClick={() => startEditing(subject)}>Edit</button>
                          <button className="btn-small" style={{ backgroundColor: 'transparent', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#FC8181' }} onClick={() => handleDelete(subject.subjectId)}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
