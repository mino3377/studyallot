//C:\Users\chiso\nextjs\study-allot\src\components\infocards\progress-rate-card.tsx

"use client"

import { useEffect, useState } from "react"

type ProgressRateCardProps = {
  avgActualPct: number
  avgPlannedPct: number
}

type Status = "ahead" | "behind" | "ontrack"

export default function ProgressRateCard({
  avgActualPct,
  avgPlannedPct,
}: ProgressRateCardProps) {
  const planned = Number.isFinite(avgPlannedPct)
    ? Math.max(0, Math.min(100, Math.round(avgPlannedPct)))
    : 0
  const actual = Number.isFinite(avgActualPct)
    ? Math.max(0, Math.min(100, Math.round(avgActualPct)))
    : 0

  const status: Status =
    actual > planned ? "ahead" : actual < planned ? "behind" : "ontrack"

  const actualBarClass =
    status === "ahead"
      ? "bg-emerald-400"
      : status === "behind"
      ? "bg-red-400"
      : "bg-yellow-400"

  // actual% の文字色（バーと同じ系統）
  const actualTextClass =
    status === "ahead"
      ? "text-emerald-500"
      : status === "behind"
      ? "text-red-500"
      : "text-yellow-500"

  // 0 -> actual へアニメーションさせるための表示用値
  const [animatedActual, setAnimatedActual] = useState(0)

  useEffect(() => {
    // いったん0に戻してから伸ばす（表示切り替え時も毎回気持ちよく動く）
    setAnimatedActual(0)
    const raf = requestAnimationFrame(() => setAnimatedActual(actual))
    return () => cancelAnimationFrame(raf)
  }, [actual])

  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 items-baseline gap-1">
        <div className={`text-l font-semibold ${actualTextClass}`}>{actual}%</div>
        <div className="text-xs text-muted-foreground">（{planned}%）</div>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded bg-muted">
        {/* ベース（今のまま） */}
        <div
          className="absolute left-0 top-0 h-full bg-gray-200"
          style={{ width: `100%` }}
        />

        {/* actual：0 -> actual% に伸びる（transitionでアニメ） */}
        <div
          className={`absolute left-0 top-0 h-full z-20 ${actualBarClass} transition-[width] duration-700 ease-out`}
          style={{ width: `${animatedActual}%` }}
        />

        {/* planned：そのまま */}
        <div
          className="absolute left-0 top-0 h-full z-10 bg-gray-400"
          style={{ width: `${planned}%` }}
        />
      </div>
    </div>
  )
}