import React from 'react'
import { Card } from '../ui/card'
import { CheckCircle2 } from 'lucide-react'

type CompletionTillTodayCardProps = {
  actualCellsUntilToday: number,
  plannedCellsUntilToday: number,
  todayRatePct: number

}



export default function CompletionTillTodayCard({ actualCellsUntilToday, plannedCellsUntilToday, todayRatePct }: CompletionTillTodayCardProps) {
  return (
    <Card className="gap-3 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">完了/計画</div>
        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-2xl font-semibold sm:mr-2">
        {actualCellsUntilToday} / {plannedCellsUntilToday}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {todayRatePct}% 達成
      </div>
    </Card>
  )
}
