import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginV1 } from '../api/v1'
import { useAuth } from '../context/AuthContext'

function RadarVisual() {
  return (
    <svg
      viewBox="0 0 220 220"
      className="w-[min(420px,75%)] aspect-square"
      role="img"
      aria-label="Stylised robot radar"
    >
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(124,109,255,0.35)" />
          <stop offset="60%" stopColor="rgba(124,109,255,0.08)" />
          <stop offset="100%" stopColor="rgba(124,109,255,0)" />
        </radialGradient>
        <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(124,109,255,0)" />
          <stop offset="100%" stopColor="rgba(124,109,255,0.55)" />
        </linearGradient>
      </defs>

      <circle cx="110" cy="110" r="100" fill="url(#radarGlow)" />

      {[35, 60, 85, 105].map((r) => (
        <circle
          key={r}
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="rgba(124,109,255,0.35)"
          strokeWidth="1"
          className="radar-ring"
          style={{ animationDelay: `${r * 0.02}s` }}
        />
      ))}

      {/* axes */}
      <line x1="10" y1="110" x2="210" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="110" y1="10" x2="110" y2="210" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* rotating sweep */}
      <g className="radar-sweep">
        <path d="M 110 110 L 210 110 A 100 100 0 0 0 110 10 Z" fill="url(#sweep)" />
      </g>

      {/* sample blips */}
      <circle cx="148" cy="78"  r="2.5" fill="#2ee5a0" />
      <circle cx="74"  cy="142" r="2.5" fill="#7c6dff" />
      <circle cx="162" cy="138" r="2.5" fill="#7c6dff" />

      {/* center robot */}
      <circle cx="110" cy="110" r="6" fill="#7c6dff" />
      <circle cx="110" cy="110" r="11" fill="none" stroke="rgba(124,109,255,0.55)" strokeWidth="1" />
    </svg>
  )
}

function StatusLine({ label, value, dot }: { label: string; value: string; dot: 'live' | 'idle' }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span
        className={`inline-block size-2 rounded-full ${
          dot === 'live'
            ? 'bg-emerald-400 pulse-live shadow-[0_0_6px_rgba(46,229,160,0.7)]'
            : 'bg-white/30'
        }`}
        aria-hidden
      />
      <span className="uppercase tracking-[0.18em] text-muted/80 font-medium min-w-[120px]">
        {label}
      </span>
      <span className="text-white/85 font-mono">{value}</span>
    </div>
  )
}

const DEFAULT_COMMANDER_EMAIL = 'commander@robocontrol.local'
const DEFAULT_COMMANDER_PASSWORD = 'commander123'

export function Login() {
  const navigate = useNavigate()
  const { setTokens } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function fillDefaults() {
    setEmail(DEFAULT_COMMANDER_EMAIL)
    setPassword(DEFAULT_COMMANDER_PASSWORD)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokens = await loginV1(email, password)
      await setTokens(tokens.access_token, tokens.refresh_token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell grid lg:grid-cols-[1.05fr_1fr] min-h-screen">
      {/* ── Left: visual / brand panel (lg+ only) ─────────────────── */}
      <aside className="auth-visual hidden lg:flex flex-col justify-between p-12 xl:p-16 relative">
        <header className="flex items-center gap-3 relative z-10">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 border border-accent/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bcb5ff"
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
            </svg>
          </span>
          <div>
            <p className="text-white font-semibold tracking-tight">RoboControl</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted/70">Mission Control</p>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center relative z-10">
          <RadarVisual />
        </div>

        <footer className="relative z-10 flex flex-col gap-3 max-w-md">
          <h2 className="text-white text-2xl font-semibold leading-tight tracking-tight">
            Real-time control surface
            <br />
            <span className="text-muted/80 font-normal">for your robot fleet.</span>
          </h2>
          <div className="mt-6 flex flex-col gap-2.5 border-t border-white/5 pt-5">
            <StatusLine label="Robot link"      value="ROBOT-01 · online"   dot="live" />
            <StatusLine label="Telemetry"       value="streaming"           dot="live" />
            <StatusLine label="Last commander"  value="—"                   dot="idle" />
          </div>
          <p className="mt-6 text-[10px] tracking-[0.22em] uppercase text-muted/30">
            CMP9134 · v1.0
          </p>
        </footer>
      </aside>

      {/* ── Right: form panel ─────────────────────────────────────── */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile branding (lg- hidden on the left panel) */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 border border-accent/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bcb5ff"
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </span>
            <div>
              <p className="text-white font-semibold tracking-tight">RoboControl</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted/70">Mission Control</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-white text-2xl font-semibold tracking-tight">
              Welcome back, operator
            </h1>
            <p className="text-muted/80 text-sm mt-1.5">
              Sign in with your credentials to take control of the robot.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="operator@mission.ctrl"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-compact w-full px-4 py-3 rounded-lg text-sm font-mono tracking-wide"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted/70">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[11px] text-muted/60 hover:text-accent transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-compact w-full px-4 py-3 rounded-lg text-sm"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-sm text-danger bg-danger/8 border border-danger/20 rounded-lg px-3.5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary mt-2 w-full py-3.5 rounded-lg text-white text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Authenticating…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Default commander hint (dev convenience) */}
          <div className="mt-6 rounded-lg border border-accent/15 bg-accent/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-accent/80 font-semibold mb-1.5">
              Default commander
            </p>
            <p className="text-xs text-muted/85 leading-relaxed">
              On first boot the API creates a COMMANDER account so you can sign in
              immediately. Use{' '}
              <span className="font-mono text-white/85">{DEFAULT_COMMANDER_EMAIL}</span>{' '}
              /{' '}
              <span className="font-mono text-white/85">{DEFAULT_COMMANDER_PASSWORD}</span>.
            </p>
            <button
              type="button"
              onClick={fillDefaults}
              className="mt-2.5 text-[11px] font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Fill these credentials →
            </button>
          </div>

          <p className="mt-8 text-center text-muted/70 text-xs tracking-wide">
            No account yet?{' '}
            <Link to="/register" className="text-accent font-semibold hover:text-accent/80 transition-colors">
              Register as a viewer
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
