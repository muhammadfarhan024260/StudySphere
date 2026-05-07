import { useState } from 'react'
import api from '../services/api'

/* ── Icons ───────────────────────────────────────────── */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const CHANNELS = [
  { key: 'email', label: 'Email',  sub: 'Real delivery',  Icon: MailIcon,  colorKey: 'blue' },
  { key: 'sms',   label: 'SMS',    sub: 'Stub / demo',    Icon: PhoneIcon, colorKey: 'gold' },
  { key: 'push',  label: 'Push',   sub: 'Stub / demo',    Icon: BellIcon,  colorKey: 'green'},
]

export default function NotificationDeliveryDemo() {
  const [notifId, setNotifId] = useState('')
  const [channels, setChannels] = useState({ email: true, sms: false, push: false })
  const [loading, setLoading]   = useState(false)
  const [result,  setResult]    = useState(null)
  const [error,   setError]     = useState('')

  const toggle = key => setChannels(prev => ({ ...prev, [key]: !prev[key] }))

  const handleDeliver = async () => {
    if (!notifId) { setError('Please enter a notification ID.'); return }
    setError(''); setResult(null)
    try {
      setLoading(true)
      const { email, sms, push } = channels
      const res = await api.post(
        `/intelligence/notifications/${notifId}/deliver?email=${email}&sms=${sms}&push=${push}`
      )
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Delivery failed. Check the notification ID.')
    } finally {
      setLoading(false)
    }
  }

  const activeChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k)

  return (
    <div className="nd-wrap">
      {/* Description */}
      <p className="nd-desc">
        Each channel (<strong>Email</strong>, <strong>SMS</strong>, <strong>Push</strong>) is a{' '}
        <strong>Decorator</strong> wrapping the base in-app delivery. The chain is built at
        runtime — only the toggled channels are added.
      </p>

      {/* Channel selector cards */}
      <div className="nd-channel-row">
        {CHANNELS.map(({ key, label, sub, Icon, colorKey }) => (
          <button
            key={key}
            type="button"
            className={`nd-channel nd-ch-${colorKey}${channels[key] ? ' nd-active' : ''}`}
            onClick={() => toggle(key)}
          >
            <div className="nd-channel-icon"><Icon /></div>
            <div className="nd-channel-label">{label}</div>
            <div className="nd-channel-sub">{sub}</div>
            <div className={`nd-channel-check${channels[key] ? ' nd-checked' : ''}`}>
              {channels[key] ? <CheckIcon /> : null}
            </div>
          </button>
        ))}
      </div>

      {/* Notification ID input + send */}
      <div className="nd-send-row">
        <div className="nd-input-wrap">
          <label className="nd-input-label">Notification ID</label>
          <input
            type="number"
            className="nd-input"
            value={notifId}
            onChange={e => setNotifId(e.target.value)}
            placeholder="e.g. 1"
            min="1"
            onKeyDown={e => e.key === 'Enter' && handleDeliver()}
          />
        </div>

        <div className="nd-send-meta">
          <span className="nd-active-channels">
            {activeChannels.length === 0
              ? 'No channels selected'
              : `Sending via: ${activeChannels.join(', ')}`}
          </span>
          <button
            className="btn-primary nd-send-btn"
            onClick={handleDeliver}
            disabled={loading || activeChannels.length === 0}
          >
            <SendIcon />
            {loading ? 'Delivering…' : 'Deliver Notification'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error nd-feedback">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="nd-result">
          <div className="nd-result-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="nd-result-title">Notification Delivered</div>
            <div className="nd-result-channels">
              Channels active:{' '}
              {Object.entries(result.channels || {})
                .filter(([, v]) => v)
                .map(([k]) => (
                  <span key={k} className="nd-result-badge">{k}</span>
                ))}
              {Object.values(result.channels || {}).every(v => !v) && <span>none</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
