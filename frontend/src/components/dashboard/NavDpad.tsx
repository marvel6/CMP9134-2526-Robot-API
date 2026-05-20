import type { ReactNode } from 'react'
import { NavigationEnumV1, type NavigationV1 } from '../../api/v1'

interface NavDpadProps {
  disabled?: boolean
  onMove: (direction: NavigationV1) => void
  compact?: boolean
}

function PadButton({
  label,
  children,
  disabled,
  onClick,
  variant = 'direction',
  compact = false,
}: {
  label: string
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  variant?: 'direction' | 'stop'
  compact?: boolean
}) {
  const size = compact ? 'size-9' : 'size-11 sm:size-12'
  const base =
    'touch-manipulation inline-flex items-center justify-center rounded-xl font-medium transition-[background,border,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2'
  const cls =
    variant === 'stop'
      ? `${base} dashboard-nav-stop ${size} text-[0.5rem] cursor-default`
      : `${base} dashboard-nav-btn ${size} ${compact ? 'text-base' : 'text-lg'} disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]`

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cls} aria-label={label}>
      {children}
    </button>
  )
}

export function NavDpad({ disabled, onMove, compact = false }: NavDpadProps) {
  const spacer = compact ? 'size-9' : 'size-11 sm:size-12'
  const gap = compact ? 'gap-1.5' : 'gap-2'

  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 ${gap} w-fit mx-auto`}
      role="group"
      aria-label="Robot navigation"
    >
      <span className={spacer} aria-hidden />
      <PadButton compact={compact} label="Move north" disabled={disabled} onClick={() => onMove(NavigationEnumV1.UP)}>
        ↑
      </PadButton>
      <span className={spacer} aria-hidden />

      <PadButton compact={compact} label="Move west" disabled={disabled} onClick={() => onMove(NavigationEnumV1.LEFT)}>
        ←
      </PadButton>
      <PadButton compact={compact} label="Stop" variant="stop">
        ●
      </PadButton>
      <PadButton compact={compact} label="Move east" disabled={disabled} onClick={() => onMove(NavigationEnumV1.RIGHT)}>
        →
      </PadButton>

      <span className={spacer} aria-hidden />
      <PadButton compact={compact} label="Move south" disabled={disabled} onClick={() => onMove(NavigationEnumV1.DOWN)}>
        ↓
      </PadButton>
      <span className={spacer} aria-hidden />
    </div>
  )
}
