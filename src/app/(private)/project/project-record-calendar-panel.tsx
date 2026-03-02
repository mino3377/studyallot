// C:\Users\chiso\nextjs\study-allot\src\components\material\project-record-calendar-panel.tsx
"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns"
import type { DateRange } from "react-day-picker"

type UnitType = "section" | "chapter" | "unit" | "page"

type MaterialLike = {
  slug: string
  title: string
  startDate: string
  endDate: string
  totalUnits: number
  lapsTotal: number
  planDays?: number[]
  // ★追加：実績（この日やった数）をプロジェクトカレンダーで出すため
  actualDays?: number[]
}

type Task = {
  id: string
  unitNo: number
  lap: number
}

function iso(d: Date) {
  return format(d, "yyyy-MM-dd")
}

function parseISODateOnly(s?: string) {
  if (!s) return undefined
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function isInRange(d: Date, range?: DateRange) {
  if (!range?.from || !range?.to) return false
  return !isBefore(d, range.from) && !isAfter(d, range.to)
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

function distributeEvenlyCounts(taskLen: number, dayLen: number): number[] {
  if (dayLen <= 0) return []
  const base = Math.floor(taskLen / dayLen)
  let rem = taskLen % dayLen
  const out: number[] = []
  for (let i = 0; i < dayLen; i++) {
    const take = base + (rem > 0 ? 1 : 0)
    rem = Math.max(0, rem - 1)
    out.push(take)
  }
  return out
}

function buildPlanMapFromDays(
  range: DateRange,
  tasks: Task[],
  planDays?: number[]
): Record<string, Task[]> {
  const from = range.from
  const to = range.to
  const map: Record<string, Task[]> = {}
  if (!from || !to) return map

  const days = eachDayOfInterval({ start: from, end: to })
  const N = days.length

  const countsRaw =
    planDays && planDays.length > 0
      ? planDays.slice(0, N)
      : distributeEvenlyCounts(tasks.length, N)

  const counts: number[] = Array.from({ length: N }, (_, i) => countsRaw[i] ?? 0).map((x) =>
    Number.isFinite(x) ? Math.max(0, Math.floor(x)) : 0
  )

  let idx = 0
  for (let i = 0; i < N; i++) {
    const dayISO = iso(days[i]!)
    const take = Math.max(0, Math.floor(counts[i]!))
    map[dayISO] = tasks.slice(idx, idx + take)
    idx += take
  }

  if (idx < tasks.length && N > 0) {
    const lastISO = iso(days[N - 1]!)
    map[lastISO] = [...(map[lastISO] ?? []), ...tasks.slice(idx)]
  }

  return map
}

// ★追加：actualDays を dateISO -> count にする
function buildCountMapFromDays(range: DateRange, counts?: number[]): Record<string, number> {
  const from = range.from
  const to = range.to
  const out: Record<string, number> = {}
  if (!from || !to) return out

  const days = eachDayOfInterval({ start: from, end: to })
  for (let i = 0; i < days.length; i++) {
    const dISO = iso(days[i]!)
    const v = counts?.[i]
    out[dISO] = Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0
  }
  return out
}

function clampToRange(today: Date, range: DateRange) {
  const from = range.from
  const to = range.to
  if (!from || !to) return undefined

  const t = new Date(today)
  t.setHours(0, 0, 0, 0)

  if (t.getTime() < from.getTime()) return from
  if (t.getTime() > to.getTime()) return to
  return t
}

type Props = {
  projectName?: string
  materials: MaterialLike[]
  unitType?: UnitType
  unitLabel?: string
  onSelectMaterialSlug?: (slug: string) => void
}

export default function ProjectRecordCalendarPanel({
  projectName,
  materials,
  unitType = "section",
  unitLabel = "セクション",
  onSelectMaterialSlug,
}: Props) {
  const projectRange = React.useMemo<DateRange>(() => {
    const dates = materials
      .flatMap((m) => [parseISODateOnly(m.startDate), parseISODateOnly(m.endDate)])
      .filter(Boolean) as Date[]
    if (dates.length === 0) return { from: undefined, to: undefined }
    const from = new Date(Math.min(...dates.map((d) => d.getTime())))
    const to = new Date(Math.max(...dates.map((d) => d.getTime())))
    return { from, to }
  }, [materials])

  const ready = !!projectRange.from && !!projectRange.to

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(
    clampToRange(new Date(), projectRange)
  )

  React.useEffect(() => {
    if (!ready) return
    setSelectedDay(clampToRange(new Date(), projectRange))
  }, [ready, projectRange.from?.getTime(), projectRange.to?.getTime()])

  const planByMaterial = React.useMemo(() => {
    const out: Record<string, { title: string; map: Record<string, Task[]> }> = {}
    for (const m of materials) {
      const range: DateRange = { from: parseISODateOnly(m.startDate), to: parseISODateOnly(m.endDate) }
      const tasks = makeAllTasks(m.lapsTotal, m.totalUnits)
      out[m.slug] = { title: m.title, map: buildPlanMapFromDays(range, tasks, m.planDays) }
    }
    return out
  }, [materials])

  const actualByMaterial = React.useMemo(() => {
    const out: Record<string, Record<string, number>> = {}
    for (const m of materials) {
      const range: DateRange = { from: parseISODateOnly(m.startDate), to: parseISODateOnly(m.endDate) }
      out[m.slug] = buildCountMapFromDays(range, m.actualDays)
    }
    return out
  }, [materials])

  const selectedISO = selectedDay ? iso(selectedDay) : ""

  const dayItems = React.useMemo(() => {
    if (!selectedISO) return []
    const items: { slug: string; materialTitle: string; count: number }[] = []
    for (const k of Object.keys(planByMaterial)) {
      const entry = planByMaterial[k]!
      const c = entry.map[selectedISO]?.length ?? 0
      if (c > 0) items.push({ slug: k, materialTitle: entry.title, count: c })
    }
    return items
  }, [planByMaterial, selectedISO])

  const dayTotal = React.useMemo(() => dayItems.reduce((a, b) => a + b.count, 0), [dayItems])

  const inRangeModifier = (date: Date) => isInRange(date, projectRange)
  const isStart = (date: Date) => !!projectRange?.from && isSameDay(date, projectRange.from)
  const isEnd = (date: Date) => !!projectRange?.to && isSameDay(date, projectRange.to)

  if (!ready) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center text-sm text-muted-foreground border rounded-md">
        プロジェクト内に教材がありません
      </div>
    )
  }

  return (
    <div className="space-y-2 flex flex-col flex-1 min-h-0 h-full">
      <div className="bg-black dark:bg-white rounded-xl">
        <Card className="w-fit p-0">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              defaultMonth={projectRange.from ?? new Date()}
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
                  const isIn = isInRange(d, projectRange)

                  let planTotal = 0
                  for (const k of Object.keys(planByMaterial)) {
                    planTotal += planByMaterial[k]!.map[dayISO]?.length ?? 0
                  }

                  let actualTotal = 0
                  for (const k of Object.keys(actualByMaterial)) {
                    actualTotal += actualByMaterial[k]![dayISO] ?? 0
                  }

                  const show = !modifiers.outside && isIn

                  const isRest = planTotal <= 0

                  return (
                    <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                      {children}
                      {!modifiers.outside && (
                        <div className="mt-0.5 flex items-center justify-center">
                          {show ? (
                            isRest ? (
                              <span className="text-[10px] text-muted-foreground leading-none">休</span>
                            ) : (
                              <span className="text-[10px] font-semibold leading-none">
                                {String(Math.max(0, actualTotal))}
                                <span className="text-muted-foreground">/{String(Math.max(0, planTotal))}</span>
                              </span>
                            )
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
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {projectName ? `${projectName}` : "プロジェクト全体"}
            </div>
            <div className="text-sm font-bold">
              {selectedDay ? `${iso(selectedDay)} (${weekdayJP(selectedDay)})` : "-"}
            </div>
            <div className="text-xs text-muted-foreground">
              今日の合計: {dayTotal} {unitLabel}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto">
          {selectedDay && dayItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">この日はタスクなし</div>
          ) : (
            <ul className="space-y-2">
              {dayItems.map((it, idx) => (
                <li
                  key={`${it.materialTitle}-${idx}`}
                  className="rounded-md border px-3 py-2 bg-muted cursor-pointer"
                  onClick={() => onSelectMaterialSlug?.(it.slug)}
                >
                  <div className="text-sm font-semibold truncate">{it.materialTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.count} {unitLabel}
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