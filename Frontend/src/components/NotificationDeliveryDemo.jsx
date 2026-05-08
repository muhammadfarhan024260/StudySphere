import { useState } from 'react'
import api from '../services/api'

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
  { key: 'email',    label: 'Email',     sub: 'HTML email via SMTP',    Icon: MailIcon,      colorKey: 'blue'  },
  { key: 'whatsapp', label: 'WhatsApp',  sub: 'Twilio sandbox message', Icon: WhatsAppIcon,  colorKey: 'green' },
  { key: 'push',     label: 'Push',      sub: 'Firebase FCM browser',   Icon: BellIcon,      colorKey: 'gold'  },
]

export default function NotificationDeliveryDemo() {
  const [message,  setMessage]  = useState('')
  const [channels, setChannels] = useState({ email: true, whatsapp: false, push: false })
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')

  const toggle = key => setChannels(prev => ({ ...prev, [key]: !prev[key] }))

  const handleBroadcast = async () => {
    if (!message.trim()) { setError('Please enter a message.'); return }
    if (!channels.email && !channels.whatsapp && !channels.push) {
      setError('Select at least one delivery channel.'); return
    }
    setError(''); setResult(null)
    try {
      setLoading(true)
      const res = await api.post('/admin/notifications/broadcast', {
        message: message.trim(),
        email:    channels.email,
        whatsapp: channels.whatsapp,
        push:     channels.push,
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Broadcast failed.')
    } finally {
      setLoading(false)
    }
  }

  const activeChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k)

  return (
    <div className="nd-wrap">
      <p className="nd-desc">
        Write a message and select channels. The <strong>Decorator Pattern</strong> builds
        the delivery chain at runtime — Base → Email? → WhatsApp? → Push? — and sends to{' '}
        <strong>all active students</strong> at once.
      </p>

      {/* Message textarea */}
      <div className="nd-msg-group">
        <label className="nd-input-label">Broadcast Message</label>
        <textarea
          className="nd-textarea"
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="e.g. Midterm exam schedule has been updated. Please check the portal."
          maxLength={300}
        />
        <span className="nd-char-count">{message.length}/300</span>
      </div>

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

      {/* Send row */}
      <div className="nd-send-row">
        <span className="nd-active-channels">
          {activeChannels.length === 0
            ? 'No channels selected'
            : `Sending via: ${activeChannels.join(', ')}`}
        </span>
        <button
          className="btn-primary nd-send-btn"
          onClick={handleBroadcast}
          disabled={loading || activeChannels.length === 0 || !message.trim()}
        >
          <SendIcon />
          {loading ? 'Broadcasting…' : 'Broadcast to All Students'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error nd-feedback">
          <span>⚠</span> {error}
        </div>
      )}

      {result && (
        <div className="nd-result">
          <div className="nd-result-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="nd-result-title">{result.message}</div>
            <div className="nd-result-channels">
              {(result.channels || []).map(ch => (
                <span key={ch} className="nd-result-badge">{ch}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
