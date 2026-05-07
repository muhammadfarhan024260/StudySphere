import './HomePage.css'
import ThemeToggle from './ThemeToggle'

const FEATURES = [
  {
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Smart Study Tracking',
    desc: 'Log sessions by subject with duration, productivity scores, and focus ratings. Every hour is accountable.',
    color: 'green',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: 'Goal Management',
    desc: 'Set weekly and monthly study targets per subject. Track completion and stay on course with live progress.',
    color: 'blue',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: 'Weak Area Detection',
    desc: 'Database-level triggers flag subjects with consistently low productivity so you never miss a warning sign.',
    color: 'red',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: 'Performance Analytics',
    desc: 'Rich visual breakdowns — study hours, streaks, subject balance, and productivity trends over time.',
    color: 'gold',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: 'Smart Notifications',
    desc: 'Contextual alerts built on the Decorator pattern. Milestone hits, overdue goals, and weak-area nudges.',
    color: 'violet',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Report Generation',
    desc: 'Export academic performance reports in multiple formats via the Adapter pattern. Ready for advisors.',
    color: 'teal',
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
  {
    number: '125+',
    label: 'Active Students',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    number: '2,847',
    label: 'Study Sessions',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    number: '8.2',
    label: 'Avg Productivity',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    number: '94%',
    label: 'Goal Completion',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  },
]

const TESTIMONIALS = [
  {
    quote: 'This platform completely changed how I study. The weak area detection caught my OS subject slipping before exams.',
    name: 'Ali Hassan',
    enrollment: '21-131242-082',
    initials: 'AH',
  },
  {
    quote: 'Setting weekly goals and seeing the progress bar fill up is genuinely motivating. Best study tool at BU.',
    name: 'Fatima Malik',
    enrollment: '22-131242-147',
    initials: 'FM',
  },
  {
    quote: 'The analytics showed I was spending 3x more time on easy subjects. Fixed my whole schedule in a week.',
    name: 'Usman Raza',
    enrollment: '21-131242-203',
    initials: 'UR',
  },
]

const IconFlame = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
)
const IconStar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconClock = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconTrophy = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
)
const IconTarget = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconZap = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const BADGES = [
  { icon: IconFlame,  label: '7-Day Streak',   desc: 'Study 7 days in a row',    gradient: 'linear-gradient(135deg,#ff9a3c,#ff5f00)' },
  { icon: IconStar,   label: 'First Goal',      desc: 'Complete your first goal',  gradient: 'linear-gradient(135deg,#ffd700,#f59e0b)' },
  { icon: IconClock,  label: '100 Hours',       desc: 'Log 100 study hours',       gradient: 'linear-gradient(135deg,#58cc02,#4bb200)' },
  { icon: IconTrophy, label: 'Top Scorer',      desc: 'Reach productivity 9+',     gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)' },
  { icon: IconTarget, label: 'Perfect Week',    desc: 'Hit all weekly targets',    gradient: 'linear-gradient(135deg,#1cb0f6,#0d8ac4)' },
  { icon: IconZap,    label: 'Weak Area Fixed', desc: 'Improve a flagged subject', gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)' },
]

const GradCapSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)

const GearSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export default function HomePage({ onGoToLogin, onGoToSignup }) {
  return (
    <div>
      {/* ── NAVBAR ── */}
      <nav className="hp-nav">
        <a className="hp-nav-logo" href="#">
          <img src="/icon.png" alt="StudySphere" className="hp-nav-logo-img" />
          <span className="hp-nav-logo-text">StudySphere</span>
        </a>
        <div className="hp-nav-actions">
          <ThemeToggle />
          <button className="hp-nav-login" onClick={onGoToLogin}>Log in</button>
          <button className="hp-nav-signup" onClick={() => onGoToSignup('student')}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-bg" aria-hidden="true" />

        {/* LEFT: Copy */}
        <div className="hp-hero-left">
          <div className="hp-hero-badge">
            <span className="hp-hero-badge-dot" />
            Built for Bahria University Students
          </div>

          <h1 className="hp-hero-title">
            Your academic<br />
            <span className="accent">command centre.</span>
          </h1>

          <p className="hp-hero-sub">
            Log sessions, set goals, and get intelligent alerts the moment
            your performance dips. StudySphere turns raw study hours into
            <strong> actionable insights</strong>.
          </p>

          <div className="hp-hero-actions">
            <button className="hp-btn-primary" onClick={() => onGoToSignup('student')}>
              Start for free
            </button>
            <button className="hp-btn-secondary" onClick={onGoToLogin}>
              Sign in →
            </button>
          </div>

          <div className="hp-hero-proof">
            <div className="hp-hero-avatars">
              {['AH','FM','UR','MK'].map(s => (
                <span key={s} className="hp-hero-avatar">{s}</span>
              ))}
            </div>
            <span className="hp-hero-proof-text">
              Joined by <strong>125+</strong> BU students this semester
            </span>
          </div>
        </div>

        {/* RIGHT: Floating product cards */}
        <div className="hp-hero-right" aria-hidden="true">
          <div className="hp-hero-cards">

            {/* Streak card */}
            <div className="hp-hero-card hp-hero-card--streak">
              <div className="hp-hcard-row">
                <span className="hp-hcard-icon">🔥</span>
                <div className="hp-hcard-info">
                  <div className="hp-hcard-label">Study Streak</div>
                  <div className="hp-hcard-value">7 days in a row</div>
                </div>
                <div className="hp-hcard-xp">+50 XP</div>
              </div>
              <div className="hp-hcard-days">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className={`hp-hcard-day${i < 5 ? ' hp-hcard-day--done' : ''}`}>
                    <div className="hp-hcard-day-pip" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress card */}
            <div className="hp-hero-card hp-hero-card--progress">
              <div className="hp-hcard-title">Weekly Progress</div>
              {[
                { sub: 'Algorithms', h: 8, pct: 80 },
                { sub: 'DBMS',       h: 5, pct: 50 },
                { sub: 'OOP',        h: 3, pct: 30 },
              ].map(({ sub, h, pct }) => (
                <div key={sub} className="hp-hcard-subject">
                  <div className="hp-hcard-subject-top">
                    <span className="hp-hcard-subject-name">{sub}</span>
                    <span className="hp-hcard-subject-hrs">{h}h</span>
                  </div>
                  <div className="hp-hcard-track">
                    <div className="hp-hcard-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Alert card */}
            <div className="hp-hero-card hp-hero-card--alert">
              <div className="hp-hcard-alert-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Weak Area Detected
              </div>
              <div className="hp-hcard-alert-sub">Database Systems</div>
              <div className="hp-hcard-alert-desc">Avg productivity 4.2 / 10 — last 3 sessions</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="hp-stats">
        <div className="hp-stats-inner">
          {STATS.map(({ number, label, svg }) => (
            <div key={label} className="hp-stat-item">
              <div className="hp-stat-icon">{svg}</div>
              <div className="hp-stat-number">{number}</div>
              <div className="hp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACHIEVEMENT BADGES ── */}
      <div className="hp-achievements">
        <div className="hp-achievements-inner">
          <div className="hp-achievements-header">
            <div className="hp-section-tag">Gamification</div>
            <h2 className="hp-achievements-title">Earn achievements as you grow</h2>
            <p className="hp-achievements-sub">Every milestone unlocks a badge. Stay motivated, stay consistent.</p>
          </div>
          <div className="hp-badges-row">
            {BADGES.map((b) => (
              <div key={b.label} className="hp-badge-item">
                <div className="hp-badge-circle" style={{ background: b.gradient }}>
                  <b.icon />
                </div>
                <div className="hp-badge-label">{b.label}</div>
                <div className="hp-badge-desc">{b.desc}</div>
              </div>
            ))}
          </div>
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
            <div key={f.title} className={`hp-feature-card hp-feature-card--${f.color}`}>
              <div className="hp-feature-icon">{f.svg}</div>
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
            <div className="hp-user-icon"><GradCapSvg /></div>
            <div className="hp-user-type">For Students</div>
            <h3 className="hp-user-title">Your academic<br />command centre</h3>
            <ul className="hp-user-list">
              <li>Study session logging with productivity score</li>
              <li>Goal setting and progress tracking</li>
              <li>Weak area detection and alerts</li>
              <li>Performance analytics and streaks</li>
              <li>Resource recommendations per subject</li>
            </ul>
            <button className="hp-btn-primary" style={{ marginTop: '28px' }} onClick={() => onGoToSignup('student')}>
              Create student account
            </button>
          </div>

          <div className="hp-user-card">
            <div className="hp-user-icon hp-user-icon--admin"><GearSvg /></div>
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

      {/* ── TESTIMONIALS ── */}
      <div className="hp-testimonials">
        <div className="hp-testimonials-inner">
          <div className="hp-section-tag">Student Reviews</div>
          <h2 className="hp-section-title">Loved by students</h2>
          <div className="hp-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.enrollment} className="hp-testimonial-card">
                <div className="hp-testimonial-quote">"</div>
                <p className="hp-testimonial-text">{t.quote}</p>
                <div className="hp-testimonial-author">
                  <div className="hp-testimonial-avatar">{t.initials}</div>
                  <div className="hp-testimonial-info">
                    <div className="hp-testimonial-name">{t.name}</div>
                    <div className="hp-testimonial-enrollment">{t.enrollment}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="hp-cta">
        <h2 className="hp-cta-title">
          Your study data is<br />
          <span className="accent">waiting to be unlocked.</span>
        </h2>
        <p className="hp-cta-sub">
          Join StudySphere today. Free for all Bahria University students.
        </p>
        <div className="hp-hero-actions" style={{ justifyContent: 'center' }}>
          <button className="hp-btn-primary" onClick={() => onGoToSignup('student')}>
            Get started — it's free
          </button>
          <button className="hp-btn-secondary" onClick={onGoToLogin}>
            Sign in →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <img src="/icon.png" alt="StudySphere" className="hp-footer-logo-img" />
            <span className="hp-footer-brand-name">StudySphere</span>
          </div>
          <div className="hp-footer-links">
            <a className="hp-footer-link" href="#features">Features</a>
            <a className="hp-footer-link" href="#how-it-works">How it works</a>
            <button className="hp-footer-link hp-footer-link--btn" onClick={onGoToLogin}>Login</button>
            <button className="hp-footer-link hp-footer-link--btn" onClick={() => onGoToSignup('student')}>Sign up</button>
          </div>
          <div className="hp-footer-copy">
            © 2026 StudySphere · Bahria University Academic Management
          </div>
        </div>
      </footer>
    </div>
  )
}
