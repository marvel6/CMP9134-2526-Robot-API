import type { ConnectionStatus } from '../../hooks/useRobotTelemetry'

interface TelemetryBarProps {
  battery: number | null
  robotStatus: string
  connectionStatus: ConnectionStatus
  lidarActive: boolean
}

function statusTone(status: string): 'idle' | 'moving' | 'warn' | 'neutral' {
  const s = status.toUpperCase()
  if (s === 'IDLE' || s === '') return 'idle'
  if (s === 'MOVING') return 'moving'
  if (s === 'LOW_BATTERY' || s === 'STUCK') return 'warn'
  return 'neutral'
}

function formatStatus(status: string): string {
  if (!status) return 'Idle'
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function TelemetryBar({
  battery,
  robotStatus,
  connectionStatus,
  lidarActive,
}: TelemetryBarProps) {
  const tone = statusTone(robotStatus)
  const linkOk = connectionStatus === 'connected'
  const linkLabel =
    connectionStatus === 'connected'
      ? 'Live'
      : connectionStatus === 'connecting'
        ? 'Connecting'
        : connectionStatus === 'reconnecting'
          ? 'Reconnecting'
          : 'Offline'

  const batteryLevel = battery != null ? Math.min(100, Math.max(0, battery)) : null

  return (
    <nav className="dashboard-telemetry-bar" aria-label="Robot telemetry">
      <div className="dashboard-telemetry-bar__item dashboard-telemetry-bar__item--battery">
        <span className="dashboard-telemetry-bar__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="2" y="7" width="16" height="10" rx="2" />
            <path d="M20 10v4" strokeLinecap="round" />
            <rect
              x="4.5"
              y="9.5"
              width={batteryLevel != null ? `${(batteryLevel / 100) * 11}` : 0}
              height="5"
              rx="1"
              fill="currentColor"
              stroke="none"
              className="dashboard-telemetry-bar__battery-fill"
            />
          </svg>
        </span>
        <div className="dashboard-telemetry-bar__body">
          <span className="dashboard-telemetry-bar__label">Battery</span>
          <span className="dashboard-telemetry-bar__value tabular-nums">
            {batteryLevel != null ? `${batteryLevel}%` : '—'}
          </span>
        </div>
        {batteryLevel != null && (
          <div
            className="dashboard-telemetry-bar__meter"
            role="presentation"
            aria-hidden
          >
            <span
              className={`dashboard-telemetry-bar__meter-fill ${
                batteryLevel <= 20 ? 'dashboard-telemetry-bar__meter-fill--low' : ''
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        )}
      </div>

      <div
        className={`dashboard-telemetry-bar__item dashboard-telemetry-bar__item--status dashboard-telemetry-bar__item--${tone}`}
      >
        <span className="dashboard-telemetry-bar__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <div className="dashboard-telemetry-bar__body">
          <span className="dashboard-telemetry-bar__label">Status</span>
          <span className="dashboard-telemetry-bar__value">{formatStatus(robotStatus)}</span>
        </div>
        <span className={`dashboard-telemetry-bar__dot dashboard-telemetry-bar__dot--${tone}`} />
      </div>

      <div className="dashboard-telemetry-bar__item dashboard-telemetry-bar__item--lidar">
        <span className="dashboard-telemetry-bar__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="5" />
          </svg>
        </span>
        <div className="dashboard-telemetry-bar__body">
          <span className="dashboard-telemetry-bar__label">Lidar</span>
          <span className="dashboard-telemetry-bar__value">{lidarActive ? 'Active' : 'Idle'}</span>
        </div>
        <span
          className={`dashboard-telemetry-bar__dot ${
            lidarActive ? 'dashboard-telemetry-bar__dot--moving' : 'dashboard-telemetry-bar__dot--idle'
          }`}
        />
      </div>

      <div
        className={`dashboard-telemetry-bar__item dashboard-telemetry-bar__item--link ${
          linkOk
            ? 'dashboard-telemetry-bar__item--ok'
            : connectionStatus === 'disconnected'
              ? 'dashboard-telemetry-bar__item--err'
              : 'dashboard-telemetry-bar__item--warn'
        }`}
      >
        <span className="dashboard-telemetry-bar__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="dashboard-telemetry-bar__body">
          <span className="dashboard-telemetry-bar__label">Link</span>
          <span className="dashboard-telemetry-bar__value">{linkLabel}</span>
        </div>
        <span
          className={`dashboard-telemetry-bar__dot ${
            linkOk ? 'dashboard-telemetry-bar__dot--moving' : 'dashboard-telemetry-bar__dot--warn'
          } ${linkOk ? 'pulse-live' : ''}`}
        />
      </div>
    </nav>
  )
}
