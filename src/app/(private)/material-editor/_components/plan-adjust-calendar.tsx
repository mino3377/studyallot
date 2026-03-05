//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\_components\plan-adjust-calendar-panel.tsx
"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  addDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns"
import type { DateRange } from "react-day-picker"
import type { UnitType } from "@/lib/type/unit-type"
import { taskLabelRange, taskLabelSingle } from "@/lib/unit-wording"

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
  unitCount: number
  laps: number
  unitLabel: string
  unitType: UnitType
  restDays: Set<number>
  onPlanDaysChange?: (days: number[]) => void
  initialPlanDays?: number[]
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

function nextDayInRange(cur: Date, range: DateRange) {
  if (!range.from || !range.to) return null
  const nxt = addDays(cur, 1)
  if (isAfter(nxt, range.to)) return null
  return nxt
}

function toDisplayTasks(unitType: UnitType, tasks: Task[]): DisplayTask[] {
  const out: DisplayTask[] = []
  const sorted = [...tasks].sort(
    (a, b) => (a.lap - b.lap) || (a.unitNo - b.unitNo)
  )

  let i = 0
  while (i < sorted.length) {
    const start = sorted[i]!
    let j = i

    // ★同一lap内で unitNo が連番の間だけ伸ばす（lap跨ぎは絶対まとめない）
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
        label: taskLabelSingle(unitType, start.unitNo, start.lap),
      })
    } else {
      out.push({
        key: `${start.id}..${end.id}`,
        label: taskLabelRange(unitType, start.unitNo, end.unitNo, start.lap),
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

  if (idx < tasks.length && days.length > 0) {
    const lastISO = iso(days[days.length - 1]!)
    map[lastISO] = [...(map[lastISO] ?? []), ...tasks.slice(idx)]
  }

  return map
}

export default function PlanAdjustCalendar({
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

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(range?.from)
  const [plan, setPlan] = React.useState<Record<string, Task[]>>({})

  const restKey = React.useMemo(() => Array.from(restDays).sort().join(","), [restDays])
  const initialKey = React.useMemo(() => (initialPlanDays ?? []).join("|"), [initialPlanDays])

  React.useEffect(() => {
    if (!ready) return
    const tasks = makeAllTasks(laps, unitCount)

    const daysAll = eachDayOfInterval({ start: range.from!, end: range.to! })
    const N = daysAll.length

    const pArr = Array.from({ length: N }, (_, i) => {
      const v = initialPlanDays?.[i]
      return Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0
    })
    const hasPlan = pArr.some((n) => n > 0)

    const exclude = restDays.size > 0 ? restDays : new Set<number>()
    const p = hasPlan ? planFromCounts(tasks, range, pArr) : distributeEvenly(tasks, range, exclude)

    setPlan(p)
    setSelectedDay(range.from)
  }, [
    ready,
    laps,
    unitCount,
    unitLabel,
    unitType,
    range?.from?.getTime(),
    range?.to?.getTime(),
    restKey,
    initialKey,
  ])

  React.useEffect(() => {
    if (!ready) return
    if (!range.from || !range.to) return
    const days = eachDayOfInterval({ start: range.from, end: range.to })
    const out = days.map((d) => (plan[iso(d)]?.length ?? 0))
    onPlanDaysChange?.(out)
  }, [ready, plan, onPlanDaysChange, range.from?.getTime(), range.to?.getTime()])

  const selectedISO = selectedDay ? iso(selectedDay) : ""
  const selectedTasksRaw = selectedISO ? plan[selectedISO] ?? [] : []
  const displayTasks = React.useMemo(
    () => toDisplayTasks(unitType, selectedTasksRaw),
    [unitType, selectedTasksRaw]
  )

  const addOneFromTomorrow = () => {
    if (!ready || !selectedDay) return
    if (!isInRange(selectedDay, range)) return

    const tomorrow = nextDayInRange(selectedDay, range)
    if (!tomorrow) return

    const todayISO = iso(selectedDay)
    const tomISO = iso(tomorrow)

    setPlan((prev) => {
      const todayArr = [...(prev[todayISO] ?? [])]
      const tomArr = [...(prev[tomISO] ?? [])]
      if (tomArr.length === 0) return prev

      const moved = tomArr.shift()!
      todayArr.push(moved)

      return { ...prev, [todayISO]: todayArr, [tomISO]: tomArr }
    })
  }

  const removeOneToTomorrow = () => {
    if (!ready || !selectedDay) return
    if (!isInRange(selectedDay, range)) return

    const tomorrow = nextDayInRange(selectedDay, range)
    if (!tomorrow) return

    const todayISO = iso(selectedDay)
    const tomISO = iso(tomorrow)

    setPlan((prev) => {
      const todayArr = [...(prev[todayISO] ?? [])]
      if (todayArr.length === 0) return prev

      const tomArr = [...(prev[tomISO] ?? [])]
      const moved = todayArr.pop()!
      tomArr.unshift(moved)

      return { ...prev, [todayISO]: todayArr, [tomISO]: tomArr }
    })
  }

  const tomorrow = ready && selectedDay ? nextDayInRange(selectedDay, range) : null
  const tomorrowCount = tomorrow ? (plan[iso(tomorrow)]?.length ?? 0) : 0
  const canPlus = !!tomorrow && tomorrowCount > 0 && !!selectedDay && isInRange(selectedDay, range)
  const canMinus = !!tomorrow && selectedTasksRaw.length > 0 && !!selectedDay && isInRange(selectedDay, range)

  const inRangeModifier = (date: Date) => isInRange(date, range)
  const isStart = (date: Date) => !!range?.from && isSameDay(date, range.from)
  const isEnd = (date: Date) => !!range?.to && isSameDay(date, range.to)

  if (!ready) return null

  return (
    <div className="md:ml-2 lg:mr-1 space-y-2 flex flex-col flex-1 min-h-0 h-full lg:col-span-1">
      <div className="bg-gray-100 dark:bg-gray-300 rounded-xl">
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
                  const count = plan[dayISO]?.length ?? 0
                  const isIn = isInRange(d, range)
                  const showCount = !modifiers.outside && isIn && count > 0
                  const showRest = !modifiers.outside && isIn && !showCount // ← 0も休

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
      </div>

      <CardContent className="flex flex-col space-y-2 mb-2 p-3 border rounded-md flex-1 min-h-0 h-full">
        <div className="flex gap-2 items-center justify-between">
          <div className="text-md font-bold flex justify-center">
            {selectedDay ? `${iso(selectedDay)} (${weekdayJP(selectedDay)})` : "-"}
          </div>

          <div className="flex flex-wrap items-center gap-4">
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
                        min-w-[18px] h-[18px] px-1 
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