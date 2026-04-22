import { useEffect, useState } from 'react'
import api from '../services/api'
import './Intelligence.css'

const emptyForm = { subjectId: '', title: '', content: '', minScoreThreshold: 50 }

export default function AdminRecommendations() {
  const adminId = localStorage.getItem('userId')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/intelligence/recommendations')
      setItems(res.data)
      setError('')
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      subjectId: Number(form.subjectId),
      adminId: Number(adminId) || 0,
      title: form.title,
      content: form.content,
      minScoreThreshold: Number(form.minScoreThreshold),
    }
    try {
      if (editingId) {
        await api.put(`/intelligence/recommendations/${editingId}`, payload)
      } else {
        await api.post('/intelligence/recommendations', payload)
      }
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    }
  }

  const edit = (r) => {
    setEditingId(r.recommendationId)
    setForm({
      subjectId: r.subjectId,
      title: r.title,
      content: r.content,
      minScoreThreshold: r.minScoreThreshold,
    })
  }

  const remove = async (id) => {
    await api.delete(`/intelligence/recommendations/${id}`)
    await load()
  }

  return (
    <div className="intel-panel">
      <section className="intel-section">
        <h3>{editingId ? 'Edit recommendation' : 'New recommendation'}</h3>
        <form className="intel-form" onSubmit={submit}>
          <div className="intel-form-row">
            <label>Subject ID
              <input type="number" required value={form.subjectId}
                     onChange={e => setForm({ ...form, subjectId: e.target.value })} />
            </label>
            <label>Threshold (avg below)
              <input type="number" min="0" max="100" required value={form.minScoreThreshold}
                     onChange={e => setForm({ ...form, minScoreThreshold: e.target.value })} />
            </label>
          </div>
          <label>Title
            <input type="text" required maxLength={150} value={form.title}
                   onChange={e => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>Content
            <textarea required rows={3} value={form.content}
                      onChange={e => setForm({ ...form, content: e.target.value })} />
          </label>
          <div className="intel-form-actions">
            <button className="btn-primary" type="submit">{editingId ? 'Save' : 'Create'}</button>
            {editingId && (
              <button type="button" className="btn-secondary"
                      onClick={() => { setEditingId(null); setForm(emptyForm) }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="intel-section">
        <h3>All recommendations</h3>
        {loading
          ? <p>Loading…</p>
          : error
            ? <p className="intel-error">{error}</p>
            : items.length === 0
              ? <p className="intel-empty">No recommendations yet.</p>
              : (
                <table className="intel-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Threshold</th>
                      <th>Author</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(r => (
                      <tr key={r.recommendationId}>
                        <td>{r.title}</td>
                        <td>{r.subjectName}</td>
                        <td>&lt; {r.minScoreThreshold}</td>
                        <td>{r.authoredBy}</td>
                        <td>{new Date(r.createdDate).toLocaleDateString()}</td>
                        <td className="intel-row-actions">
                          <button className="btn-small" onClick={() => edit(r)}>Edit</button>
                          <button className="btn-small btn-danger" onClick={() => remove(r.recommendationId)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
      </section>
    </div>
  )
}
