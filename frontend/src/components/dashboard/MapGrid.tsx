import { memo } from 'react'

interface MapGridProps {
  width: number
  height: number
  grid: number[][]
  robotX: number
  robotY: number
  loading?: boolean
}

/** Top-down differential-drive rover */
function RobotMarker() {
  return (
    <span className="map-robot" aria-hidden>
      <span className="map-robot__glow" />
      <svg className="map-robot__svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="9" width="18" height="14" rx="4" fill="currentColor" />
        <circle cx="9" cy="12" r="2.25" fill="#0f172a" fillOpacity="0.35" />
        <circle cx="23" cy="12" r="2.25" fill="#0f172a" fillOpacity="0.35" />
        <circle cx="9" cy="20" r="2.25" fill="#0f172a" fillOpacity="0.35" />
        <circle cx="23" cy="20" r="2.25" fill="#0f172a" fillOpacity="0.35" />
        <path d="M16 5 L19 10 H13 Z" fill="#38bdf8" />
        <circle cx="16" cy="16" r="2" fill="white" fillOpacity="0.95" />
      </svg>
    </span>
  )
}

function ObstacleBlock() {
  return <span className="map-obstacle-block" aria-hidden />
}

type CellKind = 'free' | 'obstacle' | 'robot'

function cellKind(
  value: number,
  x: number,
  y: number,
  robotX: number,
  robotY: number,
): CellKind {
  if (x === robotX && y === robotY) return 'robot'
  if (value === 1) return 'obstacle'
  return 'free'
}

function MapGridInner({ width, height, grid, robotX, robotY, loading }: MapGridProps) {
  const cells = Array.from({ length: width * height }, (_, i) => {
    const x = i % width
    const y = Math.floor(i / width)
    const value = grid[y]?.[x] ?? 0
    const kind = cellKind(value, x, y, robotX, robotY)
    const alt = (x + y) % 2 === 1

    return (
      <div
        key={`${x}-${y}`}
        className={`map-tile map-tile--${kind}${kind === 'free' && alt ? ' map-tile--alt' : ''}`}
        aria-hidden={kind !== 'robot'}
        aria-label={kind === 'robot' ? `Robot at ${x}, ${y}` : undefined}
      >
        {kind === 'robot' && <RobotMarker />}
        {kind === 'obstacle' && <ObstacleBlock />}
      </div>
    )
  })

  return (
    <div className="map-board-wrap">
      <div className="map-board-meta">
        <span>
          Robot <strong className="tabular-nums">{robotX},{robotY}</strong>
        </span>
        <span className="map-board-meta__legend">
          <span className="map-board-meta__key map-board-meta__key--clear">Open</span>
          <span className="map-board-meta__key map-board-meta__key--wall">Wall</span>
          <span className="map-board-meta__key map-board-meta__key--bot">Unit</span>
        </span>
      </div>

      <div
        className={`map-board ${loading ? 'map-board--loading' : ''}`}
        role="img"
        aria-label={`Map ${width} by ${height}. Robot at ${robotX}, ${robotY}.`}
      >
        <div
          className="map-board__mesh"
          style={{
            gridTemplateColumns: `repeat(${width}, 1fr)`,
            gridTemplateRows: `repeat(${height}, 1fr)`,
          }}
        >
          {cells}
        </div>

        {loading && (
          <div className="map-board__loader" aria-live="polite">
            <div className="map-board__loader-ring" />
            <span>Updating map…</span>
          </div>
        )}
      </div>
    </div>
  )
}

export const MapGrid = memo(MapGridInner)
