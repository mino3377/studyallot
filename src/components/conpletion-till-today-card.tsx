import React from 'react'
import { Card } from './ui/card'

type CompletionTillTodayCardProps = {
  actualCellsUntilToday: number,
  plannedCellsUntilToday: number,
  todayRatePct: number

}



export default function CompletionTillTodayCard({ actualCellsUntilToday, plannedCellsUntilToday, todayRatePct }: CompletionTillTodayCardProps) {
  return (
    <Card className="gap-3 p-4">
      <div className="text-sm text-muted-foreground">今日までの完了</div>
      <div className="mt-2 text-2xl font-semibold">
        {actualCellsUntilToday} / {plannedCellsUntilToday}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        {plannedCellsUntilToday === 0 ? "期間未設定または目標なし" : `${todayRatePct}% 達成`}
      </div>
    </Card>
  )
}
