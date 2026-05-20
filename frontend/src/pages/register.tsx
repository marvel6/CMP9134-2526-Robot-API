import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerV1 } from '../api/v1'
import { useAuth } from '../context/AuthContext'
import { APP_FOOTER, APP_NAME, APP_TAGLINE } from '../config/brand'

function RegisterGridVisual() {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const x = i % 7
    const y = Math.floor(i / 7)
    const wall = (x + y) % 5 === 0
    const pulse = (x + y) % 3 === 0
    return (
      <div
        key={i}
        className={`register-grid-cell ${wall ? 'register-grid-cell--wall' : ''} ${
          pulse ? 'register-grid-cell--pulse' : ''
        }`}
        style={{ animationDelay: `${(x + y) * 0.08}s` }}
      />
    )
  })

  return (
    <div className="register-visual-core" role="img" aria-label="Operations grid preview">
      <div className="register-grid-board">{cells}</div>
      <div className="register-visual-badge">
        <span className="register-visual-badge__dot" />
        VIEWER tier
      </div>
    </div>
  )
}

function RoleStep({ n, label, active }: { n: number; label: string; active?: boolean }) {
  return (
    <div className={`register-step ${active ? 'register-step--active' : ''}`}>
      <span className="register-step__num">{n}</span>
      <span className="register-step__label">{label}</span>
    </div>
  )
}

export function Register() {
  const navigate = useNavigate()
  const { setTokens } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const tokens = await registerV1(fullName, email, password)
      await setTokens(tokens.access_token, tokens.refresh_token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-register-shell grid lg:grid-cols-[1fr_1.05fr] min-h-screen">
      {/* Form panel — left on desktop */}
      <section className="flex items-center justify-center p-6 sm:p-10 order-2 lg:order-1">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="register-brand-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <div>
              <p className="text-white font-semibold tracking-tight">{APP_NAME}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted/70">{APP_TAGLINE}</p>
            </div>
          </div>

          <div className="register-steps mb-6">
            <RoleStep n={1} label="Profile" active />
            <div className="register-steps__line" aria-hidden />
            <RoleStep n={2} label="Access" />
          </div>

          <div className="mb-6">
            <h1 className="text-white text-2xl font-semibold tracking-tight font-[family-name:var(--font-display)]">
              Create your operator ID
            </h1>
            <p className="text-muted/80 text-sm mt-2 leading-relaxed">
              You&apos;ll join as a <span className="text-emerald-400/90 font-semibold">VIEWER</span> with
              live map and sensor access. A commander can upgrade your role to move the robot.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="fullName" className="register-label">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input-register w-full px-4 py-3 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="email" className="register-label">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@organisation.ac.uk"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input-register w-full px-4 py-3 rounded-lg text-sm font-mono tracking-wide"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="register-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-register w-full px-4 py-3 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="register-label">
                  Confirm
                </label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="auth-input-register w-full px-4 py-3 rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-sm text-danger bg-danger/8 border border-danger/20 rounded-lg px-3.5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-px shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-register mt-1 w-full py-3.5 rounded-lg text-white text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Provisioning account…
                </span>
              ) : (
                'Join as viewer'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-muted/70 text-xs tracking-wide">
            Already have access?{' '}
            <Link to="/login" className="text-emerald-400/90 font-semibold hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Visual panel — right on desktop */}
      <aside className="auth-register-visual hidden lg:flex flex-col justify-between p-12 xl:p-16 relative order-1 lg:order-2">
        <header className="flex items-center gap-3 relative z-10">
          <span className="register-brand-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <div>
            <p className="text-white font-semibold tracking-tight">{APP_NAME}</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted/70">{APP_TAGLINE}</p>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center relative z-10 py-8">
          <RegisterGridVisual />
        </div>

        <footer className="relative z-10 max-w-md">
          <h2 className="text-white text-2xl font-semibold leading-tight tracking-tight font-[family-name:var(--font-display)]">
            Onboard to the
            <br />
            <span className="text-emerald-400/90">operations floor</span>
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm text-muted/85">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Watch live telemetry and the mission map
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400/60" />
              Request COMMANDER role to drive the unit
            </li>
          </ul>
          <p className="mt-6 text-[10px] tracking-[0.22em] uppercase text-muted/30">{APP_FOOTER}</p>
        </footer>
      </aside>
    </main>
  )
}
