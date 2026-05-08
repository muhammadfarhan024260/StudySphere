import React from 'react'
import './Forms.css'

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete', 
  cancelText = 'Cancel',
  danger = true 
}) {
  if (!isOpen) return null

  return (
    <div className="form-modal-overlay">
      <div className="form-modal" style={{ maxWidth: '400px' }}>
        <div className="form-header">
          <h3>{title}</h3>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>
        <div className="study-form">
          <p style={{ 
            fontSize: '0.95rem', 
            color: 'var(--text-1)', 
            lineHeight: '1.5',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {message}
          </p>
          <div className="form-actions">
            <button 
              type="button" 
              className={danger ? "btn-primary danger-btn" : "btn-primary"} 
              onClick={onConfirm}
              style={danger ? { 
                backgroundColor: 'var(--red)', 
                borderColor: 'var(--red)',
                boxShadow: '0 4px 0 #b91c1c' 
              } : {}}
            >
              {confirmText}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
