import ThemeToggle from './ThemeToggle'

export default function AuthNav({ onBack, backLabel = '← Back to home' }) {
  return (
    <nav className="auth-nav">
      <div className="auth-nav-logo">
        <img src="/icon.png" alt="StudySphere" className="auth-nav-logo-img" />
        <span className="auth-nav-logo-text">StudySphere</span>
      </div>
      <div className="auth-nav-actions">
        <ThemeToggle />
        {onBack && (
          <button className="auth-nav-back" onClick={onBack}>{backLabel}</button>
        )}
      </div>
    </nav>
  )
}
