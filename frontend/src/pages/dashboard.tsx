import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMapV1, moveRobotV1, resetRobotV1, type NavigationV1 } from '../api/v1'
import { useRobotTelemetry } from '../hooks/useRobotTelemetry'
import { MapGrid } from '../components/dashboard/MapGrid'
import { ControlPanel } from '../components/dashboard/ControlPanel'
import { TelemetryBar } from '../components/dashboard/TelemetryBar'

const DEFAULT_SIZE = 21

export function Dashboard() {
  const { user, logout, isCommander } = useAuth()
  const { telemetry, connectionStatus } = useRobotTelemetry()
  const [mapData, setMapData] = useState<Awaited<ReturnType<typeof getMapV1>> | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [moveLoading, setMoveLoading] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const canMove = isCommander

  const handleMove = useCallback(
    async (navigation: NavigationV1) => {
      if (!canMove) return
      setMoveError(null)
      setMoveLoading(true)
      try {
        await moveRobotV1(navigation)
      } catch (err) {
        setMoveError(err instanceof Error ? err.message : 'Failed to move robot')
      } finally {
        setMoveLoading(false)
      }
    },
    [canMove],
  )

  const fetchMap = useCallback(() => {
    setMapLoading(true)
    setMapError(null)
    getMapV1()
      .then(setMapData)
      .catch((err) => setMapError(err instanceof Error ? err.message : 'Failed to load map'))
      .finally(() => setMapLoading(false))
  }, [])

  const handleReset = useCallback(async () => {
    if (!canMove) return
    setResetError(null)
    setResetLoading(true)
    try {
      await resetRobotV1()
      fetchMap()
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to reset robot')
    } finally {
      setResetLoading(false)
    }
  }, [canMove, fetchMap])

  useEffect(() => {
    fetchMap()
  }, [fetchMap])

  useEffect(() => {
    const onFocus = () => fetchMap()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchMap])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!panelOpen) return
    const mq = window.matchMedia('(min-width: 1024px)')
    if (mq.matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [panelOpen])

  // Close drawer when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setPanelOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const width = mapData?.width ?? DEFAULT_SIZE
  const height = mapData?.height ?? DEFAULT_SIZE
  const grid = mapData?.grid ?? []
  const robotX = telemetry?.position?.x ?? 0
  const robotY = telemetry?.position?.y ?? 0
  const lidarActive =
    telemetry?.sensors != null &&
    Array.isArray(telemetry.sensors.lidar) &&
    telemetry.sensors.lidar.length > 0

  const errors = [mapError, resetError].filter(Boolean)

  return (
    <div className="dashboard-shell">
      {/* Mobile / tablet: drawer backdrop */}
      <button
        type="button"
        className={`dashboard-backdrop lg:hidden ${panelOpen ? 'dashboard-backdrop--visible' : ''}`}
        aria-label="Close control panel"
        onClick={() => setPanelOpen(false)}
        tabIndex={panelOpen ? 0 : -1}
      />

      {/* Main workspace */}
      <main className="dashboard-main">
        <div className="dashboard-sticky-top">
        <header className="dashboard-header">
          <div className="dashboard-header__lead min-w-0">
            <h1 className="dashboard-title">Mission map</h1>
            <p className="dashboard-subtitle">
              Grid {width}×{height}
              <span className="hidden sm:inline"> · live telemetry</span>
            </p>
          </div>

          <div className="dashboard-header__actions">
            {errors.length > 0 && (
              <div className="dashboard-errors" role="alert">
                {errors.map((msg) => (
                  <span key={msg} className="dashboard-error-pill">
                    {msg}
                  </span>
                ))}
              </div>
            )}

            <div className="dashboard-toolbar">
              {canMove && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetLoading}
                  className="dash-btn dash-btn--secondary dash-btn--sm"
                >
                  {resetLoading ? 'Resetting…' : 'Restart'}
                </button>
              )}
              <button
                type="button"
                onClick={fetchMap}
                disabled={mapLoading}
                className="dash-btn dash-btn--primary dash-btn--sm"
              >
                {mapLoading ? 'Loading…' : 'Refresh'}
              </button>

              <button
                type="button"
                className="dash-btn dash-btn--secondary dash-btn--sm lg:hidden"
                onClick={() => setPanelOpen(true)}
                aria-expanded={panelOpen}
                aria-controls="dashboard-rail"
              >
                Controls
              </button>
            </div>
          </div>
        </header>

        <TelemetryBar
          battery={telemetry?.battery ?? null}
          robotStatus={telemetry?.status ?? ''}
          connectionStatus={connectionStatus}
          lidarActive={lidarActive}
        />
        </div>

        <section className="dashboard-map-stage" aria-label="Robot map">
          <MapGrid
            width={width}
            height={height}
            grid={grid}
            robotX={robotX}
            robotY={robotY}
            loading={mapLoading}
          />
        </section>
      </main>

      {/* Right rail — static on lg+, drawer on smaller */}
      <aside
        id="dashboard-rail"
        className={`dashboard-rail ${panelOpen ? 'dashboard-rail--open' : ''}`}
        aria-label="Control panel"
      >
        <div className="dashboard-rail__header lg:hidden">
          <p className="text-sm font-semibold text-slate-900">Controls</p>
          <button
            type="button"
            className="dash-icon-btn"
            onClick={() => setPanelOpen(false)}
            aria-label="Close panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ControlPanel
          user={user}
          isCommander={isCommander}
          sensors={telemetry?.sensors}
          moveError={moveError}
          moveLoading={moveLoading}
          onMove={handleMove}
          onLogout={() => logout()}
        />
      </aside>
    </div>
  )
}
