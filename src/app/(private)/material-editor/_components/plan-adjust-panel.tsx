// C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\_components\plan-adjust.tsx
"use client"
import { Card, CardContent } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import type { UnitType } from "@/lib/type/unit-type"
import { unitLabelByType } from "@/lib/unit-wording"
import { NotebookPen } from "lucide-react"
import PlanAdjustCalendar from "./plan-adjust-calendar"

type Props = {
  range?: DateRange
  unitCount?: number
  laps?: number
  unitLabel?: string
  unitType: UnitType
  restDays: Set<number>
  onPlanDaysChange?: (days: number[]) => void
  initialPlanDays?: number[]
}

export default function PlanAdjustPanel({
  range,
  unitCount,
  laps,
  unitLabel,
  unitType,
  restDays,
  onPlanDaysChange,
  initialPlanDays,
}: Props) {
  const ready = !!range?.from && !!range?.to && !!unitCount && !!laps && !!unitLabel

  if (!ready) {
    return (
      <Card className="w-full m-3 p-12 flex items-center">
        <CardContent className="p-0 gap-2 text-sm text-muted-foreground flex justify-center items-center">
          <NotebookPen />
          教材入力で「開始日 / 終了日 / {unitLabelByType(unitType)}数 / 周回数」を入力してください。
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="lg:grid md:grid-cols-1 min-h-0 w-full h-full">
      <PlanAdjustCalendar
        range={range!}
        unitCount={unitCount!}
        laps={laps!}
        unitLabel={unitLabel!}
        unitType={unitType}
        restDays={restDays}
        onPlanDaysChange={onPlanDaysChange}
        initialPlanDays={initialPlanDays}
      />
    </div>
  )
}