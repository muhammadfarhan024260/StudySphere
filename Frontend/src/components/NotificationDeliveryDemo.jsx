import { useState } from 'react'
import api from '../services/api'

export default function NotificationDeliveryDemo() {
  const [notifId, setNotifId] = useState('')
  const [email, setEmail]     = useState(true)
  const [sms, setSms]         = useState(false)
  const [push, setPush]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const handleDeliver = async () => {
    if (!notifId) { setError('Enter a notification ID'); return }
    setError('')
    setResult(null)
    try {
      setLoading(true)
      const res = await api.post(
        `/intelligence/notifications/${notifId}/deliver?email=${email}&sms=${sms}&push=${push}`
      )
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Delivery failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="info-text" style={{ marginBottom: '16px' }}>
        Each channel (Email, SMS, Push) is a <strong>Decorator</strong> wrapping the base
        in-app delivery. The chain is built at runtime — only the checked channels are added.
      </p>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '12px', color: '#888' }}>Notification ID</label>
          <input
            type="number"
            value={notifId}
            onChange={e => setNotifId(e.target.value)}
            placeholder="e.g. 1"
            style={{ width: '120px', padding: '6px 10px', background: '#1a1d24', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} />
          Email
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input type="checkbox" checked={sms} onChange={e => setSms(e.target.checked)} />
          SMS (stub)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input type="checkbox" checked={push} onChange={e => setPush(e.target.checked)} />
          Push (stub)
        </label>

        <button className="btn-primary" onClick={handleDeliver} disabled={loading}>
          {loading ? 'Delivering...' : 'Deliver Notification'}
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      {result && (
        <div style={{ background: '#10b98111', border: '1px solid #10b98133', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
          <strong style={{ color: '#10b981' }}>Delivered</strong>
          <span style={{ marginLeft: '8px' }}>
            Channels active: {Object.entries(result.channels).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}
          </span>
        </div>
      )}
    </div>
  )
}
