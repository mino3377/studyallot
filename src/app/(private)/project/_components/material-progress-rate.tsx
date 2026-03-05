"use client"

import { useEffect, useMemo, useState } from "react"

type ProgressRateCardProps = {
  avgActualPct: number
  size?: number
  strokeWidth?: number
}

export default function ProgressRateCard({
  avgActualPct,
  size = 44,
  strokeWidth = 6,
}: ProgressRateCardProps) {
  const actual = Number.isFinite(avgActualPct)
    ? Math.max(0, Math.min(100, Math.round(avgActualPct)))
    : 0

  const [animatedActual, setAnimatedActual] = useState(0)

  useEffect(() => {
    setAnimatedActual(0)
    const raf = requestAnimationFrame(() => setAnimatedActual(actual))
    return () => cancelAnimationFrame(raf)
  }, [actual])

  const { r, c, offset, cx } = useMemo(() => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - animatedActual / 100)
    const center = size / 2
    return { r: radius, c: circumference, offset: dashOffset, cx: center }
  }, [size, strokeWidth, animatedActual])

  return (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {/* ベース（未達成部分） */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted-foreground"
      />

      {/* 進捗部分 */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        className="text-foreground transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>

    <div className="absolute inset-0 grid place-items-center">
      <div className="text-xs font-semibold text-foreground">{actual}%</div>
    </div>
  </div>
)
}