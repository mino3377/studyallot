import React from 'react'
import { Card } from './ui/card'
import { BarChart3 } from 'lucide-react'
import { Progress } from './ui/progress'

type ProgressRateCardProps = {
  avgActualPct: number
  avgPlannedPct: number,
}

type Status = 'ahead' | 'behind' | 'ontrack'

export default function ProgressRateCard({
  avgActualPct,
  avgPlannedPct,
}: ProgressRateCardProps) {
  // 0–100 にクランプして整数化
  const planned = Number.isFinite(avgPlannedPct)
    ? Math.max(0, Math.min(100, Math.round(avgPlannedPct)))
    : 0
  const actual = Number.isFinite(avgActualPct)
    ? Math.max(0, Math.min(100, Math.round(avgActualPct)))
    : 0

  // 許容誤差 ±2%
  const status: Status =
    actual > planned + 2 ? 'ahead' : actual < planned - 2 ? 'behind' : 'ontrack'

  return (
    <Card className="p-3 gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">進捗率</div>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-2 text-2xl font-semibold">{actual}%</div>

      <div className="mt-2">
        {/* 上：計画（黒） */}
        <div className="flex items-center gap-2">
          <div className="w-full relative">
            <div className="h-2 bg-muted rounded" />
            <div
              className="absolute left-0 top-0 h-2 bg-black/60 rounded"
              style={{ width: `${planned}%` }}
            />
          </div>
          <span className="text-xs w-12 text-right">{planned}%</span>
        </div>

        {/* 下：実績（色） */}
        <div className="flex items-center gap-2">
          <Progress
            value={actual}
            className={`h-2 w-full ${
              status === 'ahead'
                ? '[&>div]:bg-emerald-500/60'
                : status === 'behind'
                ? '[&>div]:bg-red-500/60'
                : '[&>div]:bg-yellow-500/60'
            }`}
          />
          <span
            className={`text-xs w-12 text-right ${
              status === 'ahead'
                ? 'text-emerald-600/60'
                : status === 'behind'
                ? 'text-red-600/60'
                : 'text-yellow-600/60'
            }`}
          >
            {actual}%
          </span>
        </div>
      </div>
    </Card>
  )
}
