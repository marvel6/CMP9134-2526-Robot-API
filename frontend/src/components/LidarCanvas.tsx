import { useEffect, useRef } from 'react'

interface LidarCanvasProps {
  lidar: number[]
  size?: number
  theme?: 'dark' | 'light'
}

const MAX_RANGE = 10
const SWEEP_DURATION_MS = 2500

const PALETTES = {
  dark: {
    bg: '#0f1117',
    ring: 'rgba(108, 99, 255, 0.15)',
    label: 'rgba(139, 143, 168, 0.5)',
    center: '#6c63ff',
    sweep: 'rgba(108, 99, 255, 0.6)',
    obstacle: '#ff4757',
    border: 'border-white/10',
  },
  light: {
    bg: '#f1f5f9',
    ring: 'rgba(91, 79, 214, 0.2)',
    label: '#94a3b8',
    center: '#5b4fd6',
    sweep: 'rgba(91, 79, 214, 0.45)',
    obstacle: '#e11d48',
    border: 'border-slate-200',
  },
} as const

export function LidarCanvas({ lidar, size = 220, theme = 'dark' }: LidarCanvasProps) {
  const palette = PALETTES[theme]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sweepAngleRef = useRef(0)
  const animationFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const center = size / 2
    const scale = (size / 2 - 20) / MAX_RANGE

    function draw(timestamp: number) {
      if (!ctx) return

      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp
      sweepAngleRef.current = (sweepAngleRef.current + (delta / SWEEP_DURATION_MS) * 360) % 360

      ctx.fillStyle = palette.bg
      ctx.fillRect(0, 0, size, size)

      ctx.strokeStyle = palette.ring
      ctx.lineWidth = 1
      for (let r = 2; r <= 8; r += 2) {
        ctx.beginPath()
        ctx.arc(center, center, r * scale, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.fillStyle = palette.label
      ctx.font = '9px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('N', center, 10)
      ctx.fillText('S', center, size - 10)
      ctx.fillText('W', 10, center)
      ctx.fillText('E', size - 10, center)

      ctx.fillStyle = palette.center
      ctx.beginPath()
      ctx.arc(center, center, 5, 0, Math.PI * 2)
      ctx.fill()

      const sweepRad = (sweepAngleRef.current * Math.PI) / 180
      ctx.strokeStyle = palette.sweep
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.lineTo(
        center + Math.sin(sweepRad) * (size / 2 - 15),
        center - Math.cos(sweepRad) * (size / 2 - 15)
      )
      ctx.stroke()

      ctx.fillStyle = palette.obstacle
      for (let deg = 0; deg < lidar.length && deg < 360; deg++) {
        const dist = lidar[deg]
        if (dist < MAX_RANGE) {
          const angleRad = (deg * Math.PI) / 180
          const obsX = center + dist * Math.sin(angleRad) * scale
          const obsY = center - dist * Math.cos(angleRad) * scale
          ctx.beginPath()
          ctx.arc(obsX, obsY, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [lidar, size, palette])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded-lg border ${palette.border}`}
      style={{ background: palette.bg }}
    />
  )
}
