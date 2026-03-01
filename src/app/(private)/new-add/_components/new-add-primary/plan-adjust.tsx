// C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\_components\new-add-primary\plan-adjust.tsx
"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { eachDayOfInterval, format, isBefore, isAfter } from "date-fns"
import type { DateRange } from "react-day-picker"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import type { UnitType } from "./material-register-step"
import { unitLabelByType } from "@/components/unit-wording"
import { NotebookPen } from "lucide-react"
import PlanAdjustCalendarPanel from "./plan-adjust-calendar-panel"

type Task = {
  id: string
  unitNo: number
  lap: number
}

type Props = {
  range?: DateRange
  unitCount?: number
  laps?: number
  unitLabel?: string
  unitType: UnitType
  restDays: Set<number>
  onPlanDaysChange?: (days: number[]) => void
  initialPlanDays?: number[] // ★編集用
}

function iso(d: Date) {
  return format(d, "yyyy-MM-dd")
}

function makeAllTasks(laps: number, units: number): Task[] {
  const out: Task[] = []
  for (let lap = 1; lap <= laps; lap++) {
    for (let u = 1; u <= units; u++) {
      out.push({ id: `L${lap}-U${u}`, unitNo: u, lap })
    }
  }
  return out
}

function listTargetDays(range: DateRange, excludeWeekdays: Set<number>) {
  if (!range.from || !range.to) return []
  return eachDayOfInterval({ start: range.from, end: range.to }).filter(
    (d) => !excludeWeekdays.has(d.getDay())
  )
}

function distributeEvenly(
  tasks: Task[],
  range: DateRange,
  excludeWeekdays: Set<number>
): Record<string, Task[]> {
  const days = listTargetDays(range, excludeWeekdays)
  const map: Record<string, Task[]> = {}

  if (range.from && range.to) {
    for (const d of eachDayOfInterval({ start: range.from, end: range.to })) {
      map[iso(d)] = []
    }
  }
  if (days.length === 0) return map

  const base = Math.floor(tasks.length / days.length)
  let rem = tasks.length % days.length

  let idx = 0
  for (const d of days) {
    const take = base + (rem > 0 ? 1 : 0)
    rem = Math.max(0, rem - 1)

    const dayISO = iso(d)
    map[dayISO] = tasks.slice(idx, idx + take)
    idx += take
  }

  return map
}

// ★追加：DBの planDays(counts) → 日付ごとの Task[] に復元（休みは“表示”上の話なので、復元は全日でOK）
function planFromCounts(
  tasks: Task[],
  range: DateRange,
  counts: number[]
): Record<string, Task[]> {
  const map: Record<string, Task[]> = {}
  if (!range.from || !range.to) return map

  const days = eachDayOfInterval({ start: range.from, end: range.to })
  for (const d of days) map[iso(d)] = []

  let idx = 0
  for (let i = 0; i < days.length; i++) {
    const takeRaw = counts[i]
    const take = Number.isFinite(takeRaw) ? Math.max(0, Math.floor(takeRaw)) : 0
    const dayISO = iso(days[i]!)
    map[dayISO] = tasks.slice(idx, idx + take)
    idx += take
  }

  if (idx < tasks.length && days.length > 0) {
    const lastISO = iso(days[days.length - 1]!)
    map[lastISO] = [...(map[lastISO] ?? []), ...tasks.slice(idx)]
  }

  return map
}

const chartConfig = {
  planned: { label: "計画", color: "var(--chart-1)" },
  actual: { label: "実績", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function PlanAdjustDemo({
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

  const [plan, setPlan] = React.useState<Record<string, Task[]>>({})

  const restKey = React.useMemo(() => Array.from(restDays).sort().join(","), [restDays])

  React.useEffect(() => {
    if (!ready) return
    const tasks = makeAllTasks(laps!, unitCount!)
    const exclude = restDays.size > 0 ? restDays : new Set<number>()

    // ★修正：編集時の planDays を優先して復元
    const daysAll = eachDayOfInterval({ start: range!.from!, end: range!.to! })
    const N = daysAll.length
    const pArr = Array.from({ length: N }, (_, i) => {
      const v = initialPlanDays?.[i]
      return Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0
    })
    const hasPlan = pArr.some((n) => n > 0)

    const p = hasPlan ? planFromCounts(tasks, range!, pArr) : distributeEvenly(tasks, range!, exclude)
    setPlan(p)
  }, [
    ready,
    laps,
    unitCount,
    unitLabel,
    unitType,
    range?.from?.getTime(),
    range?.to?.getTime(),
    restKey,
    (initialPlanDays ?? []).join("|"),
  ])

  const chartData = React.useMemo(() => {
    if (!ready || !range?.from || !range?.to) return []
    const days = eachDayOfInterval({ start: range.from, end: range.to })
    let cumPlanned = 0
    let cumActual = 0

    return days.map((d) => {
      const dayISO = iso(d)
      const dayPlanned = plan[dayISO]?.length ?? 0
      cumPlanned += dayPlanned
      cumActual += dayPlanned
      return { date: format(d, "MM/dd"), planned: cumPlanned, actual: cumActual }
    })
  }, [ready, range?.from?.getTime(), range?.to?.getTime(), plan])

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
    <div className="lg:grid lg:grid-cols-2 min-h-0 w-full h-full">
      <PlanAdjustCalendarPanel
        range={range!}
        unitCount={unitCount!}
        laps={laps!}
        unitLabel={unitLabel!}
        unitType={unitType}
        restDays={restDays}
        onPlanDaysChange={onPlanDaysChange}
      />

      <div className="hidden lg:flex lg:flex-col flex-1 lg:col-span-1 md:ml-2 lg:mr-1">
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="text-sm font-medium">累計タスク（計画 / 実績）</div>
            <ChartContainer config={chartConfig} className="h-[170px] w-full">
              <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line dataKey="planned" type="monotone" stroke="var(--color-planned)" strokeWidth={2} dot={false} />
                <Line
                  dataKey="actual"
                  type="monotone"
                  stroke="var(--color-actual)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 4"
                  opacity={0.7}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}