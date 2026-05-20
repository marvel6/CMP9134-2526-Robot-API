import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../config/brand'
import { getAuditLogsV1, type AuditLogDataV1, type AuditLogEntryV1 } from '../api/v1'

const PER_PAGE = 10

function actionBadgeClass(action: string): string {
  switch (action) {
    case 'LOGIN':
      return 'audit-badge audit-badge--login'
    case 'COMMAND':
      return 'audit-badge audit-badge--command'
    case 'RESET_ROBOT':
      return 'audit-badge audit-badge--reset'
    default:
      return 'audit-badge'
  }
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function AuditLog() {
  const navigate = useNavigate()
  const { user, logout, isCommander } = useAuth()
  const [data, setData] = useState<AuditLogDataV1 | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAuditLogsV1({ page: p, limit: PER_PAGE })
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isCommander) {
      navigate('/dashboard', { replace: true })
      return
    }
    fetchLogs(page)
  }, [isCommander, navigate, page, fetchLogs])

  if (!isCommander) return null

  const meta = data?.meta
  const results = data?.results ?? []

  return (
    <div className="audit-page">
      <header className="audit-header">
        <div className="audit-header__lead">
          <Link to="/dashboard" className="audit-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>
          <div>
            <p className="audit-eyebrow">{APP_NAME}</p>
            <h1 className="audit-title">Audit log</h1>
            <p className="audit-subtitle">Commander activity across login, movement, and resets</p>
          </div>
        </div>

        <div className="audit-header__actions">
          <div className="audit-user-chip">
            <span className="audit-user-chip__name">{user?.full_name ?? 'Operator'}</span>
            <span className="audit-user-chip__role">{user?.role ?? 'COMMANDER'}</span>
          </div>
          <button type="button" className="dash-btn dash-btn--ghost dash-btn--sm" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <main className="audit-main">
        <div className="audit-panel">
          {error && (
            <div className="audit-alert" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="audit-loading">
              <div className="audit-loading__spinner" />
              <span>Loading entries…</span>
            </div>
          ) : results.length === 0 ? (
            <div className="audit-empty">
              <p>No audit entries yet.</p>
              <p className="audit-empty__hint">Actions appear here after logins, moves, or resets.</p>
            </div>
          ) : (
            <>
              <div className="audit-table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Direction</th>
                      <th>Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((entry: AuditLogEntryV1) => (
                      <tr key={entry.id}>
                        <td className="audit-table__time">{formatWhen(entry.created_at)}</td>
                        <td>
                          <span className={actionBadgeClass(entry.action)}>{entry.action}</span>
                        </td>
                        <td className="audit-table__muted">
                          {entry.navigation_direction ?? '—'}
                        </td>
                        <td className="audit-table__user">
                          <span className="audit-table__name">
                            {entry.user?.full_name ?? 'Unknown'}
                          </span>
                          <span className="audit-table__id" title={entry.user_id}>
                            {entry.user_id.slice(0, 8)}…
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && (
                <footer className="audit-pagination">
                  <p className="audit-pagination__info">
                    Page {meta.current_page} of {meta.last_page} · {meta.total} entries
                  </p>
                  <div className="audit-pagination__controls">
                    <button
                      type="button"
                      disabled={meta.prev == null}
                      onClick={() => setPage((p) => p - 1)}
                      className="dash-btn dash-btn--secondary dash-btn--sm"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={meta.next == null}
                      onClick={() => setPage((p) => p + 1)}
                      className="dash-btn dash-btn--primary dash-btn--sm"
                    >
                      Next
                    </button>
                  </div>
                </footer>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
