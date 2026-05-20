import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SessionData } from '../../api/v1'
import { LidarCanvas } from '../LidarCanvas'
import { NavDpad } from './NavDpad'
import type { NavigationV1 } from '../../api/v1'

interface TelemetrySensors {
  N: number
  S: number
  E: number
  W: number
  lidar: number[]
}

export interface ControlPanelProps {
  user: SessionData | null
  isCommander: boolean
  sensors: TelemetrySensors | undefined
  moveError: string | null
  moveLoading: boolean
  onMove: (direction: NavigationV1) => void
  onLogout: () => void
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="dash-section-title">{children}</h2>
}

export function ControlPanel({
  user,
  isCommander,
  sensors,
  moveError,
  moveLoading,
  onMove,
  onLogout,
}: ControlPanelProps) {
  const hasSensors = sensors != null
  const lidarActive =
    hasSensors && Array.isArray(sensors.lidar) && sensors.lidar.length > 0

  return (
    <div className="control-panel">
      <div className="control-panel__operator dash-rail-section">
        <div className="control-panel__operator-row">
          <span className="dash-brand-icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name ?? 'Operator'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <span
            className={`dash-role-badge shrink-0 ${
              user?.role === 'COMMANDER' ? 'dash-role-badge--commander' : 'dash-role-badge--viewer'
            }`}
          >
            {user?.role ?? 'VIEWER'}
          </span>
        </div>
      </div>

      <div className="control-panel__sensors dash-rail-section">
        <SectionTitle>Sensors</SectionTitle>
        <div className="control-panel__sensor-grid">
          {(['N', 'W', 'E', 'S'] as const).map((dir, idx) => {
            const positions = [
              'col-start-2',
              'col-start-1 row-start-2',
              'col-start-3 row-start-2',
              'col-start-2 row-start-3',
            ]
            const val = sensors?.[dir]
            return (
              <div
                key={dir}
                className={`dash-panel control-panel__sensor-cell ${positions[idx]}`}
              >
                <span className="text-[9px] font-medium text-slate-400 uppercase">{dir}</span>
                <span className="text-xs font-mono font-medium text-slate-800 tabular-nums">
                  {hasSensors && val != null ? `${val}u` : '—'}
                </span>
              </div>
            )
          })}
          <div
            className="col-start-2 row-start-2 rounded-lg bg-slate-100/80 control-panel__sensor-cell border border-dashed border-slate-200"
            aria-hidden
          />
        </div>

        {lidarActive && sensors && (
          <div className="control-panel__lidar">
            <LidarCanvas lidar={sensors.lidar} size={112} theme="light" />
          </div>
        )}
      </div>

      <div className="control-panel__nav dash-rail-section">
        <SectionTitle>Navigation</SectionTitle>
        {!isCommander ? (
          <p className="text-xs text-slate-500 leading-relaxed">
            Viewer mode — monitoring only.
          </p>
        ) : (
          <>
            {moveError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1.5 mb-2">
                {moveError}
              </p>
            )}
            <NavDpad disabled={moveLoading} onMove={onMove} compact />
          </>
        )}
      </div>

      <div className="control-panel__actions dash-rail-section">
        {isCommander && (
          <Link to="/audit-log" className="dash-btn dash-btn--secondary w-full dash-btn--sm">
            Audit log
          </Link>
        )}
        <button type="button" onClick={onLogout} className="dash-btn dash-btn--ghost w-full dash-btn--sm">
          Log out
        </button>
      </div>
    </div>
  )
}
