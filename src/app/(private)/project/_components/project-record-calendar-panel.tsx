//C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\_components\project-record-calendar-panel.tsx
"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { isSameDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { unitLabel, unitLabel as unit_typeLabel } from "@/lib/type/unit-type"
import { MaterialRow } from "@/lib/type/material_type"
import { dateCompare, iso, parseISODateOnly, weekdayJP } from "@/lib/date/date"
import {
  buildCountMapFromDays,
  buildPlanMapFromDays,
  clampToRange,
  makeAllTasks,
  type ProjectTask as Task,
} from "../_lib/task-map"

//
function isInRange(d: Date, range?: DateRange) {
  if (!range?.from || !range?.to) return false
  return dateCompare(range.from, d) && dateCompare(d, range.to)
}

type Props = {
  project_name: string
  materials: MaterialRow[]
  onSelectMaterialSlug?: (slug: string) => void
}

export default function ProjectRecordCalendarPanel({
  project_name,
  materials,
  onSelectMaterialSlug,
}: Props) {


  //プロジェクト内の全ての教材から開始日と終了日をだして、プロジェクトの開始日と終了日を出す
  const projectRange = React.useMemo<DateRange>(() => {
    const dates = materials
      .flatMap((m) => [parseISODateOnly(m.start_date), parseISODateOnly(m.end_date)])
      .filter(Boolean) as Date[]
    if (dates.length === 0) return { from: undefined, to: undefined }
    const from = new Date(Math.min(...dates.map((d) => d.getTime())))
    const to = new Date(Math.max(...dates.map((d) => d.getTime())))
    return { from, to }
  }, [materials])

  const ready = !!projectRange.from && !!projectRange.to


  //カレンダーの選択日（デフォルトは「今日」）
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(
    clampToRange(new Date(), projectRange)
  )

  //カレンダーの選択日を中身が変わったら変える
  React.useEffect(() => {
    if (!ready) return
    setSelectedDay(clampToRange(new Date(), projectRange))
  }, [ready, projectRange.from?.getTime(), projectRange.to?.getTime()])


  //計画:教材スラッグ:{教材名:{日付:タスク配列}}
  const planByMaterial = React.useMemo(() => {
    const out: Record<string, { title: string; map: Record<string, Task[]> }> = {}
    for (const m of materials) {
      const range: DateRange = {
        from: parseISODateOnly(m.start_date),
        to: parseISODateOnly(m.end_date),
      }
      const tasks = makeAllTasks(m.rounds, m.unit_count)
      out[m.slug] = { title: m.title, map: buildPlanMapFromDays(range, tasks, m.plan_days) }
    }
    return out
  }, [materials])


  //実際:教材スラッグ:{日付:タスク数}
  const actualByMaterial = React.useMemo(() => {
    const out: Record<string, Record<string, number>> = {}
    for (const m of materials) {
      const range: DateRange = {
        from: parseISODateOnly(m.start_date),
        to: parseISODateOnly(m.end_date),
      }
      out[m.slug] = buildCountMapFromDays(range, m.actual_days)
    }
    return out
  }, [materials])


  const selectedDayFormat = selectedDay ? iso(selectedDay) : ""

  const dayItems = React.useMemo(() => {
    if (!selectedDayFormat) return []

    const out = []

    for (const m of materials) {
      const todayTasks = planByMaterial[m.slug]?.map[selectedDayFormat] ?? []
      const count = todayTasks.length

      if (count === 0) continue

      out.push({
        slug: m.slug,
        title: m.title,
        count,
        unit_type: m.unit_type,
      })
    }

    return out
  }, [materials, planByMaterial, selectedDayFormat])

  const dayTotal = React.useMemo(() => {
    return dayItems.reduce((sum, item) => sum + item.count, 0)
  }, [dayItems])

  //期間にその日が入っているかどうか
  const inRangeModifier = (date: Date) => isInRange(date, projectRange)


  const isStart = (date: Date) => !!projectRange.from && isSameDay(date, projectRange.from)
  const isEnd = (date: Date) => !!projectRange.to && isSameDay(date, projectRange.to)

  if (!ready) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center text-sm text-muted-foreground border rounded-md">
        プロジェクト内に教材がありません
      </div>
    )
  }

  return (
    <div className="space-y-2 flex flex-col flex-1 min-h-0 h-full">
      <div className="bg-gray-100 dark:bg-gray-300 rounded-xl">
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

                  return (
                    <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                      {children}
                      {!modifiers.outside && (
                        <div className="mt-0.5 flex items-center justify-center">
                          {show ? (
                            <span className="text-[10px] font-semibold leading-none">
                              {String(Math.max(0, actualTotal))}
                              <span className="text-muted-foreground">
                                /{String(Math.max(0, planTotal))}
                              </span>
                            </span>
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

      <CardContent className="flex flex-col space-y-2 p-3 border rounded-md flex-1 min-h-0 h-full">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {project_name ? `${project_name}` : "プロジェクト全体"}
            </div>
            <div className="text-sm font-bold">
              {selectedDay ? `${iso(selectedDay)} (${weekdayJP(selectedDay)})` : "-"}
            </div>
            <div className="text-xs text-muted-foreground">
              今日の合計: {dayTotal}タスク
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
                  key={`${it.title}-${idx}`}
                  className="rounded-md border px-3 py-2 bg-muted cursor-pointer"
                  onClick={() => onSelectMaterialSlug?.(it.slug)}
                >
                  <div className="text-sm font-semibold truncate">{it.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.count} {unitLabel(it.unit_type)}
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