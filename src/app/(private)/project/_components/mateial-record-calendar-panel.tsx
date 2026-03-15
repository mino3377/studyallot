//C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\_components\mateial-record-calendar-panel.tsx

"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { eachDayOfInterval, isSameDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { taskLabelRange, taskLabelSingle } from "@/lib/unit-wording"
import type { unit_type } from "@/lib/type/unit-type"
import { unitLabel as unit_typeLabel } from "@/lib/type/unit-type"
import { dateCompare, iso, weekdayJP } from "@/lib/date/date"
import {
  buildCountMapFromDays,
  buildPlanMapFromDays,
  clampToRange,
  makeAllTasks,
  type ProjectTask as Task,
} from "../_lib/task-map"



type DisplayTask = {
  key: string
  label: string
}

type Props = {
  title?: string
  range: DateRange
  unit_count: number
  rounds: number
  unit_type: unit_type
  material_id: number
  initialActualDays?: number[]
  initialPlanDays?: number[]
  saveSectionRecordsAction: (fd: FormData) => Promise<void>
  onActualDaysSaved?: (actualDays: number[]) => void
}

function isInRange(d: Date, range?: DateRange) {
  if (!range?.from || !range?.to) return false
  return dateCompare(range.from, d) && dateCompare(d, range.to)
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function toDisplayTasks(unit_type: unit_type, tasks: Task[]): DisplayTask[] {
  if (unit_type !== "page") {
    return tasks.map((task) => ({
      key: task.id,
      label: taskLabelSingle(unit_type, task.unitNo, task.round),
    }))
  }

  const out: DisplayTask[] = []
  const sorted = [...tasks].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round
    return a.unitNo - b.unitNo
  })

  let i = 0
  while (i < sorted.length) {
    const start = sorted[i]
    let endIndex = i

    while (
      endIndex + 1 < sorted.length &&
      sorted[endIndex + 1].round === start.round &&
      sorted[endIndex + 1].unitNo === sorted[endIndex].unitNo + 1
    ) {
      endIndex++
    }

    const end = sorted[endIndex]

    out.push({
      key: `${start.id}-${end.id}`,
      label: taskLabelRange(unit_type, start.unitNo, end.unitNo, start.round),
    })

    i = endIndex + 1
  }

  return out
}

export default function MaterialRecordCalendarPanel({
  title,
  range,
  unit_count,
  rounds,
  unit_type,
  material_id,
  initialActualDays = [],
  initialPlanDays = [],
  saveSectionRecordsAction,
  onActualDaysSaved,
}: Props) {
  const ready = !!range.from && !!range.to

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(
    clampToRange(new Date(), range)
  )
  const [actualCountByISO, setActualCountByISO] = React.useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (!ready) return
    setSelectedDay(clampToRange(new Date(), range))
  }, [ready, range.from?.getTime(), range.to?.getTime()])

  const allTasks = React.useMemo(() => {
    return makeAllTasks(rounds, unit_count)
  }, [rounds, unit_count])

  const plan = React.useMemo(() => {
    return buildPlanMapFromDays(range, allTasks, initialPlanDays)
  }, [range, allTasks, initialPlanDays])

  React.useEffect(() => {
    setActualCountByISO(buildCountMapFromDays(range, initialActualDays))
  }, [range, initialActualDays])

  const dayISOs = React.useMemo(() => {
    if (!range.from || !range.to) return []
    return eachDayOfInterval({ start: range.from, end: range.to }).map((d) => iso(d))
  }, [range.from?.getTime(), range.to?.getTime()])

  const selectedISO = selectedDay ? iso(selectedDay) : ""

  const plannedToday = selectedISO ? (plan[selectedISO]?.length ?? 0) : 0

  const doneBeforeToday = React.useMemo(() => {
    let sum = 0

    for (const dayISO of dayISOs) {
      if (dayISO === selectedISO) break
      sum += actualCountByISO[dayISO] ?? 0
    }

    return sum
  }, [dayISOs, selectedISO, actualCountByISO])

  const totalTasks = allTasks.length
  const remainingFromToday = totalTasks - doneBeforeToday
  const actualCount = selectedISO ? (actualCountByISO[selectedISO] ?? 0) : 0
  const clampedActual = Math.max(0, Math.min(actualCount, remainingFromToday))

  const doneTasksRaw = React.useMemo(() => {
    return allTasks.slice(doneBeforeToday, doneBeforeToday + clampedActual)
  }, [allTasks, doneBeforeToday, clampedActual])

  const displayDoneTasks = React.useMemo(() => {
    return toDisplayTasks(unit_type, doneTasksRaw)
  }, [unit_type, doneTasksRaw])

  const today = startOfDay(new Date())
  const selected = selectedDay ? startOfDay(selectedDay) : undefined
  const isFutureSelected = !!selected && selected.getTime() > today.getTime()

  const inRangeModifier = (date: Date) => isInRange(date, range)
  const isStart = (date: Date) => !!range.from && isSameDay(date, range.from)
  const isEnd = (date: Date) => !!range.to && isSameDay(date, range.to)

  const save = async () => {
    if (!selectedISO || isFutureSelected) return

    const arr = dayISOs.map((dayISO) => actualCountByISO[dayISO] ?? 0)

    const fd = new FormData()
    fd.set("materialId", String(material_id))
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
                  const isIn = isInRange(d, range)

                  let planTotal = 0
                  let actualTotal = 0

                  if (isIn) {
                    planTotal = plan[dayISO]?.length ?? 0
                    actualTotal = actualCountByISO[dayISO] ?? 0
                  }

                  const show = !modifiers.outside && isIn

                  return (
                    <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                      {children}
                      {!modifiers.outside && (
                        <div className="mt-0.5 flex items-center justify-center">
                          {show ? (
                            <span className="text-[10px] font-semibold leading-none">
                              {String(actualTotal)}
                              <span className="text-muted-foreground">
                                /{String(planTotal)}
                              </span>
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
              今日の計画: {plannedToday} {unit_typeLabel(unit_type)}
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
                  if (!selectedISO || isFutureSelected) return

                  const next = Number(e.target.value)

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
              {displayDoneTasks.map((task, idx) => (
                <li
                  key={`${task.key}-${idx}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted"
                >
                  <div className="text-sm">
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full border text-[11px] font-semibold leading-none">
                      {idx + 1}
                    </span>{" "}
                    {task.label}
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