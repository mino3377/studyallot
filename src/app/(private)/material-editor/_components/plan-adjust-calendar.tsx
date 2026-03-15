"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns"
import type { DateRange } from "react-day-picker"
import type { unit_type } from "@/lib/type/unit-type"
import { taskLabelRange, taskLabelSingle} from "@/lib/unit-wording"
import { Share } from "lucide-react"

type Task = {
  id: string
  unitNo: number
  lap: number
}

type DisplayTask = {
  key: string
  label: string
}

type Props = {
  range: DateRange
  unit_count: number
  rounds: number
  unitLabel: string
  unit_type: unit_type
  restDays: Set<number>
  onPlanDaysChange?: (days: number[]) => void
  initialPlanDays?: number[]
  onShare?: () => void
  onManualPlanChange?: () => void
}

function iso(d: Date) {
  return format(d, "yyyy-MM-dd")
}

function isInRange(d: Date, range?: DateRange) {
  if (!range?.from || !range?.to) return false
  return !isBefore(d, range.from) && !isAfter(d, range.to)
}

function circledNumber(n: number) {
  if (n <= 0) return ""
  return String(n)
}

function weekdayJP(d: Date) {
  const names = ["日", "月", "火", "水", "木", "金", "土"]
  return names[d.getDay()] ?? ""
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

function toDisplayTasks(unit_type: unit_type, tasks: Task[]): DisplayTask[] {
  const out: DisplayTask[] = []
  const sorted = [...tasks].sort(
    (a, b) => (a.lap - b.lap) || (a.unitNo - b.unitNo)
  )

  let i = 0
  while (i < sorted.length) {
    const start = sorted[i]!
    let j = i

    while (
      j + 1 < sorted.length &&
      sorted[j + 1]!.lap === start.lap &&
      sorted[j + 1]!.unitNo === sorted[j]!.unitNo + 1
    ) {
      j++
    }

    const end = sorted[j]!

    if (start.unitNo === end.unitNo) {
      out.push({
        key: start.id,
        label: taskLabelSingle(unit_type, start.unitNo, start.lap),
      })
    } else {
      out.push({
        key: `${start.id}..${end.id}`,
        label: taskLabelRange(unit_type, start.unitNo, end.unitNo, start.lap),
      })
    }

    i = j + 1
  }

  return out
}

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

  return map
}

export default function PlanAdjustCalendar({
  range,
  unit_count,
  rounds,
  unitLabel,
  unit_type,
  restDays,
  onPlanDaysChange,
  initialPlanDays,
  onShare,
  onManualPlanChange,
}: Props) {
  const ready = !!range?.from && !!range?.to && !!unit_count && !!rounds && !!unitLabel

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(range?.from)
  const [counts, setCounts] = React.useState<number[]>([])

  const restKey = React.useMemo(() => Array.from(restDays).sort().join(","), [restDays])
  const initialKey = React.useMemo(() => (initialPlanDays ?? []).join("|"), [initialPlanDays])

  React.useEffect(() => {
    if (!ready) return
    const tasks = makeAllTasks(rounds, unit_count)

    const daysAll = eachDayOfInterval({ start: range.from!, end: range.to! })
    const N = daysAll.length

    const pArr = Array.from({ length: N }, (_, i) => {
      const v = initialPlanDays?.[i]
      return Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0
    })
    const hasPlan = pArr.some((n) => n > 0)

    const exclude = restDays.size > 0 ? restDays : new Set<number>()

    let nextCounts: number[] = []

    if (hasPlan) {
      nextCounts = pArr
    } else {
      const evenPlan = distributeEvenly(tasks, range, exclude)
      nextCounts = daysAll.map((d) => evenPlan[iso(d)]?.length ?? 0)
    }

    setCounts(nextCounts)
    setSelectedDay(range.from)
  }, [
    ready,
    rounds,
    unit_count,
    unitLabel,
    unit_type,
    range?.from?.getTime(),
    range?.to?.getTime(),
    restKey,
    initialKey,
  ])

  React.useEffect(() => {
    if (!ready) return
    onPlanDaysChange?.(counts)
  }, [ready, counts, onPlanDaysChange])

  const totalTasks = unit_count * rounds

  const plan = React.useMemo(() => {
    if (!ready) return {}
    const tasks = makeAllTasks(rounds, unit_count)
    return planFromCounts(tasks, range, counts)
  }, [ready, rounds, unit_count, range, counts])

  const countMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    if (!range.from || !range.to) return map

    const days = eachDayOfInterval({ start: range.from, end: range.to })
    for (let i = 0; i < days.length; i++) {
      map[iso(days[i]!)] = counts[i] ?? 0
    }
    return map
  }, [range, counts])

  const assignedTaskCount = React.useMemo(() => {
    return counts.reduce((sum, n) => sum + n, 0)
  }, [counts])

  const restTask = assignedTaskCount - totalTasks

  const selectedISO = selectedDay ? iso(selectedDay) : ""
  const selectedTasksRaw = selectedISO ? plan[selectedISO] ?? [] : []
  const displayTasks = React.useMemo(
    () => toDisplayTasks(unit_type, selectedTasksRaw),
    [unit_type, selectedTasksRaw]
  )

  const selectedIndex = React.useMemo(() => {
    if (!selectedDay || !range.from || !range.to) return -1
    const days = eachDayOfInterval({ start: range.from, end: range.to })
    return days.findIndex((d) => isSameDay(d, selectedDay))
  }, [selectedDay, range.from?.getTime(), range.to?.getTime()])

  const addOneFromTomorrow = () => {
    if (!ready || selectedIndex < 0) return

    onManualPlanChange?.()

    setCounts((prev) => {
      const next = [...prev]
      next[selectedIndex] = (next[selectedIndex] ?? 0) + 1
      return next
    })
  }

  const removeOneToTomorrow = () => {
    if (!ready || selectedIndex < 0) return

    onManualPlanChange?.()

    setCounts((prev) => {
      const next = [...prev]
      const current = next[selectedIndex] ?? 0
      next[selectedIndex] = Math.max(0, current - 1)
      return next
    })
  }

  const canPlus = !!selectedDay && isInRange(selectedDay, range)
  const canMinus =
    !!selectedDay && isInRange(selectedDay, range) && (counts[selectedIndex] ?? 0) > 0

  const inRangeModifier = (date: Date) => isInRange(date, range)
  const isStart = (date: Date) => !!range?.from && isSameDay(date, range.from)
  const isEnd = (date: Date) => !!range?.to && isSameDay(date, range.to)

  return (
    <div className="md:ml-2 lg:mr-1 space-y-2 flex flex-col flex-1 min-h-0 h-full lg:col-span-1">
      <div className="rounded-xl sm:flex space-y-3 sm:space-y-0 sm:gap-2 lg:justify-between sm:items-end">

        <div className="flex flex-col space-y-2 w-full">
          <div className="flex-col text-xs bg-background inline-flex items-start gap-2 font-bold">


            <div className="space-y-2">
              <div className="flex items-center gap-2 whitespace-nomal w-full justify-center">
                <div className="text-muted-foreground">タスク数 :</div>
                <div
                  className={
                    restTask > 0
                      ? " text-sm text-amber-600 "
                      : "text-sm text-destructive"
                  }
                >{restTask > 0
                  ? <span>+</span>
                  : null}
                  {restTask}
                </div>
                <div>
                  {restTask === 0 ? <div></div> : restTask > 0
                    ? <div>超過しています</div>
                    : <div>少ないです</div>}
                </div>
              </div>
              <Card className="w-fit p-0">
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    defaultMonth={range.from ?? new Date()}
                    numberOfMonths={1}
                    captionLayout="dropdown"
                    fixedWeeks
                    className={[
                      "[--cell-size:clamp(26px,7.2vw,38px)]",
                      "max-w-[calc(100vw-1.5rem)]",
                      "[&_button]:text-[12px]",
                      "[&_button]:leading-none",
                      "[&_button]:p-0",
                      "[&_.rdp-caption]:py-1",
                      "[&_.rdp-caption_label]:text-sm",
                      "[&_.rdp-row]:gap-0",
                      "[&_.rdp-cell]:p-0",
                    ].join(" ")}
                    modifiers={{
                      inStudyRange: inRangeModifier,
                      rangeStart: isStart,
                      rangeEnd: isEnd,
                    }}
                    modifiersClassNames={{
                      inStudyRange: "bg-primary/10",
                      rangeStart: "bg-primary/20 rounded-l-md",
                      rangeEnd: "bg-primary/20 rounded-r-md",
                    }}
                    components={{
                      DayButton: ({ children, modifiers, day, ...props }) => {
                        const d = day.date
                        const dayISO = iso(d)
                        const count = countMap[dayISO] ?? 0
                        const isIn = isInRange(d, range)
                        const showCount = !modifiers.outside && isIn && count > 0
                        const showRest = !modifiers.outside && isIn && !showCount

                        return (
                          <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                            {children}
                            {!modifiers.outside && (
                              <div className="mt-0.5 flex items-center justify-center">
                                {showCount ? (
                                  <span className="text-[11px] font-semibold leading-none">
                                    {circledNumber(count)}
                                  </span>
                                ) : showRest ? (
                                  <span className="text-[10px] text-muted-foreground leading-none">休</span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground leading-none">&nbsp;</span>
                                )}
                              </div>
                            )}
                          </CalendarDayButton>
                        )
                      },
                    }}
                  />
                </CardContent>
              </Card>
              <div className="flex flex-col w-full">
                <Button
                  type="button"
                  variant="default"
                  className="text-xs px-3 py-2 whitespace-normal rounded-full"
                  onClick={onShare}
                  disabled={!onShare}
                >
                  <Share />
                  計画を共有

                </Button>
              </div>
            </div>
          </div>




        </div>
      </div>

      <CardContent className="flex flex-col space-y-2 p-3 border rounded-md md:flex-1 md:min-h-0 h-full">
        <div className="flex gap-2 items-center justify-between">
          <div className="text-sm sm:text-md font-bold flex justify-center">
            {selectedDay ? `${iso(selectedDay)} (${weekdayJP(selectedDay)})` : "-"}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button
              variant="default"
              onClick={removeOneToTomorrow}
              disabled={!canMinus}
              className="text-xs p-1"
            >
              減らす
            </Button>
            <Button
              variant="default"
              onClick={addOneFromTomorrow}
              disabled={!canPlus}
              className="text-xs p-1"
            >
              増やす
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto">
          {selectedDay && displayTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">タスクなし</div>
          ) : (
            <ul className="space-y-2">
              {displayTasks.map((t, idx) => (
                <li
                  key={`${t.key}-${idx}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted"
                >
                  <div className="text-sm">
                    <span
                      className="inline-flex items-center justify-center 
                        min-w-18px h-18px px-1 
                        rounded-full border text-[11px] font-semibold leading-none"
                    >
                      {idx + 1}
                    </span>
                    {t.label}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

    </div>
  )
}