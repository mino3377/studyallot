// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\_components\actual-record-calendar-panel.tsx
"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns"
import type { DateRange } from "react-day-picker"
import { taskLabelRange, taskLabelSingle } from "@/lib/unit-wording"
import type { UnitType } from "@/lib/type/unit-type"
import { unitLabel as unitTypeLabel } from "@/lib/type/unit-type"

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
  title?: string
  range: DateRange
  unitCount: number
  laps: number
  unitLabel: string
  unitType: UnitType
  materialId: number | string
  initialActualDays?: number[]
  initialPlanDays?: number[]
  saveSectionRecordsAction: (fd: FormData) => Promise<void>
  onActualDaysSaved?: (actualDays: number[]) => void
}

function iso(d: Date) {
  return format(d, "yyyy-MM-dd")
}

function isInRange(d: Date, range?: DateRange) {
  if (!range?.from || !range?.to) return false
  return !isBefore(d, range.from) && !isAfter(d, range.to)
}

function weekdayJP(d: Date) {
  const names = ["日", "月", "火", "水", "木", "金", "土"]
  return names[d.getDay()] ?? ""
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function clampToRangeToday(range: DateRange) {
  if (!range.from || !range.to) return range.from
  const from = startOfDay(range.from)
  const to = startOfDay(range.to)
  let cur = startOfDay(new Date())

  if (cur.getTime() < from.getTime()) cur = from
  if (cur.getTime() > to.getTime()) cur = to
  return cur
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

function listTargetDays(range: DateRange) {
  if (!range.from || !range.to) return []
  return eachDayOfInterval({ start: range.from, end: range.to })
}

function distributeEvenly(tasks: Task[], range: DateRange): Record<string, Task[]> {
  const days = listTargetDays(range)
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

function planFromCounts(
  tasks: Task[],
  dayISOs: string[],
  counts: number[]
): Record<string, Task[]> {
  const map: Record<string, Task[]> = {}
  for (const d of dayISOs) map[d] = []

  let idx = 0
  for (let i = 0; i < dayISOs.length; i++) {
    const c = counts[i]
    const take = Number.isFinite(c) ? Math.max(0, Math.floor(c)) : 0
    map[dayISOs[i]!] = tasks.slice(idx, idx + take)
    idx += take
  }

  if (idx < tasks.length && dayISOs.length > 0) {
    const last = dayISOs[dayISOs.length - 1]!
    map[last] = [...(map[last] ?? []), ...tasks.slice(idx)]
  }

  return map
}

function toDisplayTasks(unitType: UnitType, tasks: Task[]): DisplayTask[] {
  if (unitType !== "page") {
    return tasks.map((t) => ({
      key: t.id,
      label: taskLabelSingle(unitType, t.unitNo, t.lap),
    }))
  }

  const out: DisplayTask[] = []
  const sorted = [...tasks].sort((a, b) => (a.lap - b.lap) || (a.unitNo - b.unitNo))

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
    out.push({
      key: `${start.id}..${end.id}`,
      label: taskLabelRange(unitType, start.unitNo, end.unitNo, start.lap),
    })

    i = j + 1
  }

  return out
}

export default function ActualRecordCalendarPanel({
  title,
  range,
  unitCount,
  laps,
  unitLabel,
  unitType,
  materialId,
  initialActualDays = [],
  initialPlanDays = [],
  saveSectionRecordsAction,
  onActualDaysSaved,
}: Props) {
  const ready = !!range?.from && !!range?.to && !!unitCount && !!laps && !!unitLabel

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(() =>
    clampToRangeToday(range)
  )

  const [plan, setPlan] = React.useState<Record<string, Task[]>>({})
  const [actualCountByISO, setActualCountByISO] = React.useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = React.useState(false)

  const allTasks = React.useMemo(() => makeAllTasks(laps, unitCount), [laps, unitCount])

  const dayISOs = React.useMemo(() => {
    if (!ready || !range.from || !range.to) return []
    return eachDayOfInterval({ start: range.from, end: range.to }).map(iso)
  }, [ready, range.from?.getTime(), range.to?.getTime()])

  React.useEffect(() => {
    if (!ready) return

    const len = dayISOs.length
    const pArr = Array.from({ length: len }, (_, i) => {
      const v = initialPlanDays[i]
      return Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0
    })
    const hasPlan = pArr.some((n) => n > 0)

    const p = hasPlan ? planFromCounts(allTasks, dayISOs, pArr) : distributeEvenly(allTasks, range)
    setPlan(p)

    setSelectedDay(clampToRangeToday(range))

    const init: Record<string, number> = {}
    const aArr = Array.from({ length: len }, (_, i) => {
      const v = initialActualDays[i]
      return Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0
    })
    for (let i = 0; i < len; i++) {
      init[dayISOs[i]!] = aArr[i] ?? 0
    }
    setActualCountByISO(init)
  }, [
    ready,
    allTasks,
    unitLabel,
    unitType,
    range?.from?.getTime(),
    range?.to?.getTime(),
    dayISOs.join("|"),
    initialActualDays.join("|"),
    initialPlanDays.join("|"),
  ])

  const selectedISO = selectedDay ? iso(selectedDay) : ""

  const today0 = startOfDay(new Date())
  const selected0 = selectedDay ? startOfDay(selectedDay) : null
  const isFutureSelected = !!selected0 && selected0.getTime() > today0.getTime()

  const plannedToday = selectedISO ? (plan[selectedISO]?.length ?? 0) : 0

  const doneBeforeToday = React.useMemo(() => {
    if (!selectedISO || dayISOs.length === 0) return 0
    let s = 0
    for (const dISO of dayISOs) {
      if (dISO === selectedISO) break
      s += Math.max(0, actualCountByISO[dISO] ?? 0)
    }
    return s
  }, [selectedISO, dayISOs, actualCountByISO])

  const totalTasks = allTasks.length
  const remainingFromToday = Math.max(0, totalTasks - doneBeforeToday)

  const actualCount = selectedISO ? (actualCountByISO[selectedISO] ?? 0) : 0
  const clampedActual = Math.max(0, Math.min(actualCount, remainingFromToday))

  const doneTasksRaw = React.useMemo(() => {
    if (!selectedISO) return []
    const start = doneBeforeToday
    const end = start + clampedActual
    return allTasks.slice(start, end)
  }, [selectedISO, doneBeforeToday, clampedActual, allTasks])

  const displayDoneTasks = React.useMemo(
    () => toDisplayTasks(unitType, doneTasksRaw),
    [unitType, doneTasksRaw]
  )

  const inRangeModifier = (date: Date) => isInRange(date, range)
  const isStart = (date: Date) => !!range?.from && isSameDay(date, range.from)
  const isEnd = (date: Date) => !!range?.to && isSameDay(date, range.to)

  const save = async () => {
    if (!ready) return
    if (dayISOs.length === 0) return
    if (isFutureSelected) return

    const arr = dayISOs.map((dISO) => {
      const v = actualCountByISO[dISO] ?? 0
      return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
    })

    const fd = new FormData()
    fd.set("materialId", String(materialId))
    fd.set("actualDays", JSON.stringify(arr))

    try {
      setIsSaving(true)
      await saveSectionRecordsAction(fd)
      onActualDaysSaved?.(arr)
    } finally {
      setIsSaving(false)
    }
  }

  if (!ready) return null

  return (
    <div className="space-y-2 flex flex-col flex-1 min-h-0 h-full">
      <div className="bg-gray-100 dark:bg-gray-300 rounded-xl">
        <Card className="w-fit p-0">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              defaultMonth={selectedDay ?? range.from ?? new Date()}
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
                  const isIn = isInRange(d, range)

                  const max = plan[dayISO]?.length ?? 0
                  const done = actualCountByISO[dayISO] ?? 0

                  const show = !modifiers.outside && isIn
                  const shownDone = Math.max(0, done)
                  const shownMax = Math.max(0, max)

                  return (
                    <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                      {children}
                      {!modifiers.outside && (
                        <div className="mt-0.5 flex items-center justify-center">
                          {show ? (
                            <span className="text-[10px] font-semibold leading-none">
                              {String(shownDone)}
                              <span className="text-muted-foreground">/{String(shownMax)}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground leading-none">
                              0/0
                            </span>
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

      <CardContent className="flex flex-col space-y-2 p-3 border rounded-md flex-1 min-h-0 h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{title ?? "実績入力"}</div>
            <div className="text-sm font-bold">
              {selectedDay ? `${iso(selectedDay)} (${weekdayJP(selectedDay)})` : "-"}
            </div>
            <div className="text-xs text-muted-foreground">
              今日の計画: {plannedToday} {unitTypeLabel(unitType)}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="inline-fit">
              <div className="text-xs text-muted-foreground mb-1">やった数</div>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={remainingFromToday}
                value={selectedISO ? String(clampedActual) : "0"}
                disabled={isFutureSelected}
                onChange={(e) => {
                  if (!selectedISO) return
                  if (isFutureSelected) return
                  const v = Number(e.target.value)
                  const next = Number.isFinite(v) ? v : 0
                  setActualCountByISO((prev) => ({
                    ...prev,
                    [selectedISO]: Math.max(0, Math.min(next, remainingFromToday)),
                  }))
                }}
              />
            </div>

            <Button onClick={save} disabled={isSaving || isFutureSelected}>
              保存
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto">
          {selectedDay && displayDoneTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">まだ入力がありません（0件）</div>
          ) : (
            <ul className="space-y-2">
              {displayDoneTasks.map((t, idx) => (
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
                    </span>{" "}
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