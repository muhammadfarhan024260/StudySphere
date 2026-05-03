import './HomePage.css'

const FEATURES = [
  {
    icon: '◎',
    title: 'Smart Study Tracking',
    desc: 'Log sessions by subject with duration, productivity scores, and focus ratings. Every hour is accountable.',
  },
  {
    icon: '◈',
    title: 'Goal Management',
    desc: 'Set weekly and monthly study targets per subject. Track completion and stay on course with live progress.',
  },
  {
    icon: '▲',
    title: 'Weak Area Detection',
    desc: 'Database-level triggers flag subjects with consistently low productivity so you never miss a warning sign.',
  },
  {
    icon: '◆',
    title: 'Performance Analytics',
    desc: 'Rich visual breakdowns — study hours, streaks, subject balance, and productivity trends over time.',
  },
  {
    icon: '⊕',
    title: 'Smart Notifications',
    desc: 'Contextual alerts built on the Decorator pattern. Milestone hits, overdue goals, and weak-area nudges.',
  },
  {
    icon: '⊞',
    title: 'Report Generation',
    desc: 'Export academic performance reports in multiple formats via the Adapter pattern. Ready for advisors.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Create Your Account',
    desc: 'Register with your Bahria University enrollment number. OTP-verified and secure from day one.',
  },
  {
    num: '02',
    title: 'Log Study Sessions',
    desc: 'Record what you studied, for how long, and how focused you were. Builds your performance baseline.',
  },
  {
    num: '03',
    title: 'Get Intelligent Insights',
    desc: 'The platform surfaces weak areas, recommends resources, and tracks your goals automatically.',
  },
]

const STATS = [
  { number: '125+', label: 'Active Students' },
  { number: '2,847', label: 'Study Sessions' },
  { number: '8.2', label: 'Avg Productivity' },
  { number: '94%', label: 'Goal Completion' },
]

export default function HomePage({ onGoToLogin, onGoToSignup }) {
  return (
    <div>
      {/* ── NAVBAR ── */}
      <nav className="hp-nav">
        <a className="hp-nav-logo" href="#">
          <span className="hp-nav-logo-icon">◈</span>
          <span className="hp-nav-logo-text">StudySphere</span>
        </a>
        <div className="hp-nav-actions">
          <button className="hp-nav-login" onClick={onGoToLogin}>Log in</button>
          <button className="hp-nav-signup" onClick={onGoToSignup}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-bg" aria-hidden="true" />
        <div className="hp-hero-grid" aria-hidden="true" />

        <div className="hp-hero-content">
          <div className="hp-hero-badge">
            <span className="hp-hero-badge-dot" />
            Built for Bahria University Students
          </div>

          <h1 className="hp-hero-title">
            Track. Analyse.<br />
            <span className="accent">Excel.</span>
          </h1>

          <p className="hp-hero-sub">
            StudySphere gives every student a command centre for their academic life —
            study logs, goal tracking, weak-area alerts, and AI-driven recommendations.
            All in one dark, beautiful dashboard.
          </p>

          <div className="hp-hero-actions">
            <button className="hp-btn-primary" onClick={onGoToSignup}>
              Start for free
            </button>
            <button className="hp-btn-secondary" onClick={onGoToLogin}>
              Sign in →
            </button>
          </div>
        </div>

        {/* Mock Browser Preview */}
        <div className="hp-hero-preview">
          <div className="hp-preview-frame">
            <div className="hp-preview-topbar">
              <div className="hp-preview-dot" />
              <div className="hp-preview-dot" />
              <div className="hp-preview-dot" />
              <div className="hp-preview-url">studysphere.app/dashboard</div>
            </div>
            <div className="hp-preview-body">
              <div className="hp-preview-sidebar">
                {[true, false, false, false, false].map((active, i) => (
                  <div key={i} className={`hp-preview-nav${active ? ' active' : ''}`} />
                ))}
              </div>
              <div className="hp-preview-main">
                <div className="hp-preview-stats">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="hp-preview-stat">
                      <div className="hp-preview-stat-val" />
                      <div className="hp-preview-stat-lbl" />
                    </div>
                  ))}
                </div>
                <div className="hp-preview-card">
                  <div className="hp-preview-bar-row">
                    {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
                      <div key={i} className="hp-preview-bar-item" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="hp-preview-card">
                  <div className="hp-preview-row" />
                  <div className="hp-preview-row" />
                  <div className="hp-preview-row" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="hp-stats">
        <div className="hp-stats-inner">
          {STATS.map(({ number, label }) => (
            <div key={label} className="hp-stat-item">
              <div className="hp-stat-number">{number}</div>
              <div className="hp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="hp-section" id="features">
        <div className="hp-features-header">
          <div className="hp-section-tag">Platform Features</div>
          <h2 className="hp-section-title">
            Everything you need to<br />own your academics
          </h2>
          <p className="hp-section-sub">
            Six tightly-integrated modules built on a robust database-driven architecture.
            No fluff — just the tools serious students need.
          </p>
        </div>
        <div className="hp-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="hp-feature-card">
              <div className="hp-feature-icon">{f.icon}</div>
              <h3 className="hp-feature-title">{f.title}</h3>
              <p className="hp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className="hp-hiw" id="how-it-works">
        <div className="hp-hiw-inner">
          <div className="hp-section-tag">Getting Started</div>
          <h2 className="hp-section-title">
            Up and running<br />in three steps
          </h2>
          <div className="hp-hiw-grid">
            {STEPS.map((s) => (
              <div key={s.num} className="hp-hiw-step">
                <div className="hp-hiw-num">{s.num}</div>
                <h3 className="hp-hiw-title">{s.title}</h3>
                <p className="hp-hiw-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── USER TYPES ── */}
      <section className="hp-section" id="who">
        <div className="hp-section-tag">Who it's for</div>
        <h2 className="hp-section-title">Built for both sides<br />of the classroom</h2>
        <div className="hp-users-grid">
          <div className="hp-user-card">
            <div className="hp-user-icon">🎓</div>
            <div className="hp-user-type">For Students</div>
            <h3 className="hp-user-title">Your academic<br />command centre</h3>
            <ul className="hp-user-list">
              <li>Study session logging with productivity score</li>
              <li>Goal setting and progress tracking</li>
              <li>Weak area detection and alerts</li>
              <li>Performance analytics and streaks</li>
              <li>Resource recommendations per subject</li>
            </ul>
            <button className="hp-btn-primary" style={{ marginTop: '28px' }} onClick={onGoToSignup}>
              Create student account
            </button>
          </div>

          <div className="hp-user-card">
            <div className="hp-user-icon">⚙️</div>
            <div className="hp-user-type">For Administrators</div>
            <h3 className="hp-user-title">Full oversight,<br />full control</h3>
            <ul className="hp-user-list">
              <li>View all student study data</li>
              <li>Broadcast and manage notifications</li>
              <li>Curate resource recommendations</li>
              <li>Generate and export reports</li>
              <li>Manage subjects and academic periods</li>
            </ul>
            <button className="hp-btn-secondary" style={{ marginTop: '28px' }} onClick={onGoToLogin}>
              Administrator login →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hp-cta">
        <h2 className="hp-cta-title">
          Your study data is<br />
          <span className="accent">waiting to be unlocked.</span>
        </h2>
        <p className="hp-cta-sub">
          Join StudySphere today. Free for all Bahria University students.
        </p>
        <button className="hp-btn-primary" onClick={onGoToSignup}>
          Get started — it's free
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <span className="hp-nav-logo-icon">◈</span>
            <span className="hp-footer-brand-name">StudySphere</span>
          </div>
          <div className="hp-footer-links">
            <button className="hp-footer-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="hp-footer-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
            <button className="hp-footer-link" onClick={onGoToLogin}>Login</button>
            <button className="hp-footer-link" onClick={onGoToSignup}>Sign up</button>
          </div>
          <div className="hp-footer-copy">
            © 2026 StudySphere · Bahria University Academic Management
          </div>
        </div>
      </footer>
    </div>
  )
}
