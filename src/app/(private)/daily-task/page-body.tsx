// src/app/(private)/daily-task/page-body.tsx
"use client"

import { use, useEffect, useMemo, useRef, useState } from "react"
import TaskDoneCheckbox from "@/app/(private)/daily-task/task-done-checkbox"
import { BookOpen, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { DailyTask, DayBucket } from "./daily-assignment"
import { saveDailySectionRecords } from "./actions"

type MaterialGroup = { materialId: number; materialSlug: string; material: string; tasks: DailyTask[] }

export default function PageBody({
  dataPromise,
  todayISO,
}: {
  dataPromise: Promise<{ week: DayBucket[]; initialChecked: Record<string, boolean> }>
  todayISO: string
}) {
  const { week, initialChecked } = use(dataPromise)

  const keyOf = (dayISO: string, taskId: string) => `${dayISO}:${taskId}`
  const [checked, setChecked] = useState<Record<string, boolean>>({ ...initialChecked })

  const [selectedIdx, setSelectedIdx] = useState(() => {
    const i = week?.findIndex(d => d.dateISO === todayISO) ?? -1
    return i >= 0 ? i : 0
  })

  const hasChanges = useMemo(() => {
    for (const day of week ?? []) {
      for (const t of day.tasks ?? []) {
        const k = keyOf(day.dateISO, t.id)
        if (!!initialChecked[k] !== !!checked[k]) return true
      }
    }
    return false
  }, [week, checked, initialChecked])

  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const visibleDays: DayBucket[] = useMemo(() => {
    if (!week || week.length === 0) return []
    return [week[Math.min(Math.max(selectedIdx, 0), week.length - 1)]]
  }, [week, selectedIdx])

  const weekRange = useMemo(() => {
    if (!week || week.length === 0) return ""
    const start = week[0]?.dateISO
    const end = week[week.length - 1]?.dateISO
    if (!start || !end) return ""
    return `${start} 〜 ${end}`
  }, [week])

  function groupByMaterial(day: DayBucket): MaterialGroup[] {
    const map = new Map<number, MaterialGroup>()
    for (const t of day.tasks ?? []) {
      const g = map.get(t.materialId)
      if (g) g.tasks.push(t)
      else map.set(t.materialId, { materialId: t.materialId, materialSlug: t.materialSlug, material: t.material, tasks: [t] })
    }
    const groups = Array.from(map.values())
    for (const g of groups) {
      g.tasks.sort((a, b) => {
        if (a.rapNo !== b.rapNo) return a.rapNo - b.rapNo
        if (a.sectionId !== b.sectionId) return a.sectionId - b.sectionId
        return a.id.localeCompare(b.id)
      })
    }
    groups.sort((a, b) => a.materialId - b.materialId)
    return groups
  }

  function setGroupChecked(dayISO: string, group: MaterialGroup, value: boolean) {
    if (dayISO !== todayISO) return
    setChecked((prev) => {
      const next = { ...prev }
      for (const t of group.tasks) next[keyOf(dayISO, t.id)] = Boolean(value)
      return next
    })
  }

  function setTaskChecked(dayISO: string, taskId: string, value: boolean) {
    if (dayISO !== todayISO) return
    setChecked((prev) => ({ ...prev, [keyOf(dayISO, taskId)]: value }))
  }

  function toggleTaskChecked(dayISO: string, taskId: string) {
    if (dayISO !== todayISO) return
    setChecked((prev) => {
      const k = keyOf(dayISO, taskId)
      return { ...prev, [k]: !prev[k] }
    })
  }

  function isGroupChecked(dayISO: string, group: MaterialGroup) {
    if (group.tasks.length === 0) return false
    return group.tasks.every((t) => !!checked[keyOf(dayISO, t.id)])
  }

  async function handleSave() {
    if (!hasChanges) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const upserts: Array<{ planId: number; sectionId: number; rapNo: number; recordedOn: string }> = []
      const deletes: Array<{ planId: number; sectionId: number; rapNo: number; recordedOn: string }> = []
      for (const day of week ?? []) {
        if (day.dateISO !== todayISO) continue
        for (const t of day.tasks ?? []) {
          const k = keyOf(day.dateISO, t.id)
          const init = !!initialChecked[k]
          const cur = !!checked[k]
          if (t.sectionId <= 0 || t.rapNo <= 0 || !t.planId) continue
          if (!init && cur) upserts.push({ planId: t.planId, sectionId: t.sectionId, rapNo: t.rapNo, recordedOn: day.dateISO })
          else if (init && !cur) deletes.push({ planId: t.planId, sectionId: t.sectionId, rapNo: t.rapNo, recordedOn: day.dateISO })
        }
      }
      const fd = new FormData()
      fd.set("payload", JSON.stringify({ upserts, deletes }))
      const res = await saveDailySectionRecords(fd)
      if (!res.ok) setSaveMsg(res.message ?? "保存に失敗しました。")
      else {
        setSaveMsg("保存しました。")
        for (const day of week ?? []) {
          for (const t of day.tasks ?? []) {
            const k = keyOf(day.dateISO, t.id)
            initialChecked[k] = !!checked[k]
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存時にエラーが発生しました。"
      setSaveMsg(msg)
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 2500)
    }
  }

  const railRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!railRef.current || !itemRefs.current[selectedIdx]) return
    const rail = railRef.current
    const item = itemRefs.current[selectedIdx]
    const railRect = rail.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const target = item.offsetLeft - (railRect.width / 2 - itemRect.width / 2)
    rail.scrollTo({ left: target, behavior: "smooth" })
  }, [selectedIdx, week?.length])

  return (
    <>
      <div ref={railRef} className="font-bold mb-4 flex gap-2 px-1 py-1 overflow-x-auto">
        {(week ?? []).map((d, i) => {
          const isToday = d.dateISO === todayISO
          const isSelected = i === selectedIdx
          const wd = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(
            new Date(d.dateISO + "T00:00:00"),
          )
          return (
            <button
              key={d.dateISO}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              onClick={() => setSelectedIdx(i)}
              className={[
                "shrink-0 px-2 py-1 rounded-md text-sm border mb-2",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-accent",
                isToday && !isSelected ? "ring-1 ring-primary/40" : "",
              ].join(" ")}
            >
              {d.dateISO.slice(5)} ({wd})
            </button>
          )
        })}
      </div>

      {visibleDays.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">本日のタスクはありません。</Card>
      ) : null}

      {visibleDays.map((day) => {
        const tasks = day.tasks ?? []
        const allDone = tasks.length > 0 && tasks.every((t) => checked[keyOf(day.dateISO, t.id)])
        const groups = groupByMaterial(day)
        const isToday = day.dateISO === todayISO

        return (
          <div key={day.dateISO} className="space-y-3 mb-6">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 text-xs">
                  {day.dateISO.slice(5)}
                </Badge>
                {allDone && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    完了
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {saveMsg ? <div className="text-xs text-muted-foreground">{saveMsg}</div> : null}
                <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
                  {saving ? "保存中…" : "保存"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              {groups.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">タスクなし</div>
              ) : (
                <>
                  {/* md以上*/}
                  <Card className="w-full py-4 hidden md:block">
                    <div className="grid bg-muted/40 text-muted-foreground text-xs font-medium grid-cols-[56px_1.2fr_1fr]">
                      <div className="px-3 py-2 whitespace-nowrap">完了</div>
                      <div className="px-3 py-2 whitespace-nowrap">教材</div>
                      <div className="whitespace-nowrap px-3 py-2">タスク</div>
                    </div>
                    <Separator className="" />
                    <div className="divide-y">
                      {groups.map((g) => {
                        const groupChecked = isGroupChecked(day.dateISO, g)
                        const unitLines = g.tasks.map((t: DailyTask) => t.unitLabel)

                        return (
                          <div
                            key={`${day.dateISO}:mat:${g.materialId}`}
                            className="mt-2 hover:bg-muted/20 transition-colors"
                          >
                            <div className="grid md:grid-cols-[56px_1.2fr_1fr]">
                              <div
                                className={
                                  "px-3 py-3 flex items-center " +
                                  (isToday ? "" : "opacity-50 pointer-events-none")
                                }
                                aria-disabled={!isToday}
                              >
                                <TaskDoneCheckbox
                                  checked={groupChecked}
                                  onCheckedChange={(v) => {
                                    if (isToday) setGroupChecked(day.dateISO, g, Boolean(v))
                                  }}
                                />
                              </div>

                              <div className="px-3 py-3 flex items-center">
                                <div className="flex items-center gap-2">
                                  <span className="rounded-xl border bg-card text-card-foreground p-2">
                                    <BookOpen className="h-4 w-4" aria-hidden />
                                  </span>
                                  <div className="min-w-0">
                                    <div className="font-medium break-words">
                                      <Link href={`/material/${g.materialSlug}`}>{g.material}</Link>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="px-3 py-3 space-y-2">
                                {g.tasks.map((t) => {
                                  const lineChecked = !!checked[keyOf(day.dateISO, t.id)]
                                  return (
                                    <button
                                      key={t.id}
                                      type="button"
                                      disabled={!isToday}
                                      onClick={() => toggleTaskChecked(day.dateISO, t.id)}
                                      className={[
                                        "w-full text-left font-bold text-sm whitespace-pre-line",
                                        "transition-opacity",
                                        !isToday ? "opacity-50 pointer-events-none" : "",
                                        lineChecked ? "opacity-50 line-through" : "",
                                      ].join(" ")}
                                    >
                                      {t.unitLabel}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>

                  {/* md未満*/}
                  <div className="w-full space-y-3 md:hidden">
                    {groups.map((g) => {
                      const groupChecked = isGroupChecked(day.dateISO, g)
                      const unitLines = g.tasks.map((t: DailyTask) => t.unitLabel)

                      return (
                        <Card key={`${day.dateISO}:matcard:${g.materialId}`} className="w-full py-2">
                          <div className="p-3 space-y-3">
                            <div className="flex items-start gap-3 ml-2">
                              <div
                                className={
                                  "pt-1 " + (isToday ? "" : "opacity-50 pointer-events-none")
                                }
                                aria-disabled={!isToday}
                              >
                                <TaskDoneCheckbox
                                  checked={groupChecked}
                                  onCheckedChange={(v) => {
                                    if (isToday) setGroupChecked(day.dateISO, g, Boolean(v))
                                  }}
                                />
                              </div>

                              <div className="flex items-start gap-2 min-w-0">
                                <div className="min-w-0">
                                  <div className="font-medium break-words">
                                    <Link href={`/material/${g.materialSlug}`}>{g.material}</Link>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator />
                            <div className="space-y-2 mx-10 w-fit">
                              {g.tasks.map((t) => {
                                const lineChecked = !!checked[keyOf(day.dateISO, t.id)]
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    disabled={!isToday}
                                    onClick={() => toggleTaskChecked(day.dateISO, t.id)}
                                    className={[
                                      "block text-left text-sm font-bold whitespace-pre-line",
                                      "transition-opacity",
                                      !isToday ? "opacity-50 pointer-events-none" : "",
                                      lineChecked ? "opacity-50 line-through" : "",
                                    ].join(" ")}
                                  >
                                    {t.unitLabel}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}
