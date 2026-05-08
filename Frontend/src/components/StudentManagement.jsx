import { useState, useEffect } from 'react'
import api from '../services/api'
import ConfirmationModal from './ConfirmationModal'
import './Dashboard.css'

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enrollmentNumber: '',
    isActive: true
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/students')
      if (res.data.success) {
        setStudents(res.data.students)
      } else {
        setError(res.data.message || 'Failed to fetch students')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleEditSubmit = async (e, id) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        enrollmentNumber: formData.enrollmentNumber,
        isActive: formData.isActive
      }
      const res = await api.put(`/admin/students/${id}`, payload)
      if (res.data.success) {
        setEditingId(null)
        fetchStudents()
      } else {
        setError(res.data.message || 'Failed to update student')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student')
    }
  }

  const startEditing = (student) => {
    setEditingId(student.id)
    setFormData({
      name: student.name,
      email: student.email,
      enrollmentNumber: student.enrollment,
      isActive: student.status === 'Active'
    })
  }

  const handleDelete = async (id) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const res = await api.delete(`/admin/students/${deleteId}`)
      if (res.data.success) {
        fetchStudents()
        setIsDeleteModalOpen(false)
        setDeleteId(null)
      } else {
        setError(res.data.message || 'Failed to delete student')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student')
    }
  }

  if (loading && students.length === 0) {
    return <div className="tab-content"><p>Loading students...</p></div>
  }

  return (
    <div className="tab-content">
      <div className="card wide">
        <div className="card-header">
          <h3>Student Management</h3>
        </div>
        
        <div className="card-body">
          {error && <div className="alert alert-error"><span>!</span> {error}</div>}

          {students.length === 0 ? (
            <p className="empty-state">No students found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Enrollment</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    {editingId === student.id ? (
                      <td colSpan="6">
                        <form onSubmit={(e) => handleEditSubmit(e, student.id)} className="inline-edit-form">
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ flex: 1 }} placeholder="Name" />
                          <input type="text" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleInputChange} placeholder="Enrollment" style={{ flex: 1 }} />
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" style={{ flex: 1 }} />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} /> Active
                          </label>
                          <button type="submit" className="btn-primary btn-small">Save</button>
                          <button type="button" className="btn-secondary btn-small" onClick={() => setEditingId(null)}>Cancel</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td>{student.id}</td>
                        <td><strong>{student.name}</strong></td>
                        <td>{student.enrollment || '-'}</td>
                        <td>{student.email}</td>
                        <td>
                          <span className={`status-badge status-${student.status.toLowerCase()}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-small" style={{ marginRight: '8px' }} onClick={() => startEditing(student)}>Edit</button>
                          <button className="btn-small" style={{ backgroundColor: 'transparent', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#FC8181' }} onClick={() => handleDelete(student.id)}>Delete</button>
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action will remove all their study data and cannot be undone."
        confirmText="Delete Student"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        danger={true}
      />
    </div>
  )
}
