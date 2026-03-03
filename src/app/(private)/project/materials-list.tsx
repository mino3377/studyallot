// C:\Users\chiso\nextjs\study-allot\src\(private)/project/materials-list.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import ProgressRateCard from "@/app/(private)/project/_components/progress-rate-card"
import { CheckSquare, Pencil, GripVertical, Trash2 } from "lucide-react"
import type { MaterialVM, UnitType } from "@/lib/type/material"
import { taskLabelRange, taskLabelSingle } from "@/components/unit-wording"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  materials: MaterialVM[]
  projectName?: string
  selectedMaterialSlug?: string | null
  onSelectMaterial?: (m: MaterialVM) => void
  onEditMaterial?: (m: MaterialVM) => void
  onDeleteMaterial?: (m: MaterialVM) => Promise<void> | void
  onReorderMaterials?: (
    orders: { materialId: number; order: number }[]
  ) => Promise<void> | void
}

type Task = { id: string; unitNo: number; lap: number }

function getTodayISOJST() {
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  return fmt.format(new Date())
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min
  if (n < min) return min
  if (n > max) return max
  return n
}

function dayCount(m: MaterialVM) {
  const start = (m.startDate ?? "").slice(0, 10)
  const end = (m.endDate ?? "").slice(0, 10)
  if (!start || !end) return 0
  const msPerDay = 24 * 60 * 60 * 1000
  const startD = new Date(`${start}T00:00:00`)
  const endD = new Date(`${end}T00:00:00`)
  const D = Math.floor((endD.getTime() - startD.getTime()) / msPerDay) + 1
  return Number.isFinite(D) ? Math.max(0, D) : 0
}

function todayIndexInRange(m: MaterialVM) {
  const start = (m.startDate ?? "").slice(0, 10)
  const end = (m.endDate ?? "").slice(0, 10)
  if (!start || !end) return { inRange: false, idx: -1, len: 0 }

  const msPerDay = 24 * 60 * 60 * 1000
  const startD = new Date(`${start}T00:00:00`)
  const endD = new Date(`${end}T00:00:00`)
  const todayD = new Date(`${getTodayISOJST()}T00:00:00`)

  const len = dayCount(m)
  if (len <= 0) return { inRange: false, idx: -1, len: 0 }

  if (todayD.getTime() < startD.getTime() || todayD.getTime() > endD.getTime()) {
    return { inRange: false, idx: -1, len }
  }

  const idx = Math.floor((todayD.getTime() - startD.getTime()) / msPerDay)
  return { inRange: true, idx: clampInt(idx, 0, len - 1), len }
}

function sumPrefix(arr: number[] | undefined, endExclusive: number) {
  const a = Array.isArray(arr) ? arr : []
  let s = 0
  for (let i = 0; i < endExclusive; i++) {
    const v = a[i]
    s += Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
  }
  return s
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

function unitLabelFromType(t: UnitType): string {
  if (t === "chapter") return "章"
  if (t === "unit") return "ユニット"
  if (t === "page") return "ページ"
  return "セクション"
}

function toDisplayLabels(unitType: UnitType, tasks: Task[]) {
  if (tasks.length === 0) return []

  if (unitType !== "page") {
    return tasks.map((t) => taskLabelSingle(unitType, t.unitNo, t.lap))
  }

  const sorted = [...tasks].sort((a, b) => (a.lap - b.lap) || (a.unitNo - b.unitNo))
  const out: string[] = []
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
    out.push(taskLabelRange(unitType, start.unitNo, end.unitNo, start.lap))
    i = j + 1
  }
  return out
}

function getTodayPlanCount(m: MaterialVM) {
  const { inRange, idx } = todayIndexInRange(m)
  if (!inRange) return { count: 0, hasPlan: false, idx: -1 }
  const plan = Array.isArray(m.planDays) ? m.planDays : []
  const hasPlan = plan.length > 0
  const v = idx >= 0 && idx < plan.length ? plan[idx] : 0
  const count = Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
  return { count, hasPlan, idx }
}

function buildTodayTaskText(m: MaterialVM) {
  const unitType: UnitType = m.unitType ?? "section"
  const unitLabel = m.unitLabel ?? unitLabelFromType(unitType)

  const { count, idx, hasPlan } = getTodayPlanCount(m)
  if (!hasPlan || count <= 0) return "今日のタスクなし"

  const allTasks = makeAllTasks(Number(m.lapsTotal ?? 0), Number(m.totalUnits ?? 0))
  const start = sumPrefix(m.planDays, Math.max(0, idx))
  const end = Math.min(allTasks.length, start + count)
  const todayTasks = allTasks.slice(start, end)
  if (todayTasks.length === 0) return "今日のタスクなし"

  const labels = toDisplayLabels(unitType, todayTasks)

  if (labels.length <= 2) return labels
  return `${labels[0]} ~ ${labels[labels.length - 1]}`
}

function calcDeltaUntilToday(m: MaterialVM) {
  const start = (m.startDate ?? "").slice(0, 10)
  const end = (m.endDate ?? "").slice(0, 10)
  if (!start || !end) return { delta: 0, hasData: false }

  const msPerDay = 24 * 60 * 60 * 1000
  const startD = new Date(`${start}T00:00:00`)
  const endD = new Date(`${end}T00:00:00`)
  const todayD = new Date(`${getTodayISOJST()}T00:00:00`)

  const D = Math.floor((endD.getTime() - startD.getTime()) / msPerDay) + 1
  if (!Number.isFinite(D) || D <= 0) return { delta: 0, hasData: false }

  const rawIdx = Math.floor((todayD.getTime() - startD.getTime()) / msPerDay)
  const fixedLen = clampInt(rawIdx + 1, 0, D)

  const planned = sumPrefix(m.planDays, fixedLen)
  const actual = sumPrefix(m.actualDays, fixedLen)

  const hasData =
    (Array.isArray(m.planDays) && m.planDays.length > 0) ||
    (Array.isArray(m.actualDays) && m.actualDays.length > 0)
  return { delta: planned - actual, hasData }
}

export default function MaterialsList({
  materials,
  onSelectMaterial,
  onEditMaterial,
  onDeleteMaterial,
  selectedMaterialSlug,
  onReorderMaterials,
}: Props) {
  const hasMaterials = materials.length > 0

  const [ordered, setOrdered] = React.useState<MaterialVM[]>(materials)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = React.useState(false)

  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (dragId) return
    setOrdered(materials)
  }, [materials, dragId])

  const COLS = "grid-cols-[22px_minmax(0,1fr)_35px_35px_35px]"

  const persistOrder = React.useCallback(
    async (nextList: MaterialVM[]) => {
      if (!onReorderMaterials) return
      const payload = nextList
        .map((m, idx) => ({
          materialId: Number(m.id),
          order: idx,
        }))
        .filter((x) => Number.isFinite(x.materialId) && x.materialId > 0)

      try {
        setIsSavingOrder(true)
        await onReorderMaterials(payload)
      } finally {
        setIsSavingOrder(false)
      }
    },
    [onReorderMaterials]
  )

  const pendingPersistRef = React.useRef<MaterialVM[] | null>(null)

  React.useEffect(() => {
    const next = pendingPersistRef.current
    if (!next) return
    pendingPersistRef.current = null
    void persistOrder(next)
  }, [ordered, persistOrder])

  const handleDropOn = React.useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) return

      setOrdered((prev) => {
        const from = prev.findIndex((x) => String(x.id) === dragId)
        const to = prev.findIndex((x) => String(x.id) === targetId)
        if (from < 0 || to < 0) return prev
        const next = [...prev]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        pendingPersistRef.current = next
        return next
      })

      setDragId(null)
    },
    [dragId]
  )

  const runDelete = React.useCallback(
    async (m: MaterialVM) => {
      if (!onDeleteMaterial) return
      const id = String(m.id)
      try {
        setIsDeletingId(id)
        await onDeleteMaterial(m)
      } finally {
        setIsDeletingId(null)
      }
    },
    [onDeleteMaterial]
  )

  return (
    <div className="space-y-3 overflow-y-auto flex flex-col h-full min-h-0 border rounded-md p-2">
      {!hasMaterials ? (
        <>
          <div className={`grid ${COLS} items-center gap-x-3 gap-y-2 px-2`}>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap" />
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">教材</div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap justify-self-center">
              進捗率
            </div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap justify-self-center">
              チェック
            </div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap justify-self-center">
              編集
            </div>
          </div>

          <div className="flex justify-center text-muted-foreground items-center p-10 h-full">
            教材がありません
          </div>
        </>
      ) : (
        <>
          <div className={`grid ${COLS} items-center gap-x-4 gap-y-2 px-2`}>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap" />
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">教材</div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap justify-center">
              進捗率
            </div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap justify-self-center">
              チェック
            </div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap justify-self-center">
              編集
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 p-1">
            {ordered.map((m) => {
              const id = String(m.id)
              const isSelected = !!selectedMaterialSlug && m.slug === selectedMaterialSlug
              const dim = !!selectedMaterialSlug && !isSelected

              const { delta, hasData } = calcDeltaUntilToday(m)
              const isDelay = hasData && delta > 0
              const isAhead = hasData && delta < 0

              const todayTaskText = buildTodayTaskText(m)

              return (
                <div
                  key={id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOn(id)}
                  className={[
                    `grid ${COLS} items-center gap-x-3 p-1 rounded-md transition`,
                    "bg-muted hover:bg-muted/60",
                    isSelected ? "ring-2 ring-primary/40" : "",
                    dim ? "opacity-35" : "",
                    dragId === id ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="justify-self-center">
                    <div
                      draggable
                      onDragStart={() => setDragId(id)}
                      onDragEnd={() => setDragId(null)}
                      className={[
                        "rounded-md p-1",
                        "cursor-grab active:cursor-grabbing",
                        "hover:bg-background/60",
                        isSavingOrder ? "opacity-60 pointer-events-none" : "",
                      ].join(" ")}
                      aria-label="ドラッグして順番変更"
                      title="ドラッグして順番変更"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="min-w-0 overflow-hidden">
                    <div className="overflow-hidden whitespace-nowrap text-ellipsis text-sm md:text-base font-semibold">
                      {m.title}
                    </div>

                    <div className="text-[10px] leading-none mt-1 text-muted-foreground">
                      {todayTaskText}
                    </div>

                    {isDelay ? (
                      <div className="text-[10px] leading-none mt-1 text-red-600">
                        {delta}タスクの遅れ
                      </div>
                    ) : isAhead ? (
                      <div className="text-[10px] leading-none mt-1 text-green-600">
                        {Math.abs(delta)}タスク進んでる
                      </div>
                    ) : null}
                  </div>

                  <div className="justify-self-center">
                    <ProgressRateCard avgActualPct={m.actualPct} />
                  </div>

                  <div className="justify-self-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="チェックを開く"
                      onClick={() => onSelectMaterial?.(m)}
                      className="hover:bg-muted/30"
                    >
                      <CheckSquare className="h-5 w-5" />
                    </Button>
                  </div>

                  <div
                    className="justify-self-center"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="教材の操作"
                          className="hover:bg-muted/30"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="p-1">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              disabled={!onDeleteMaterial || isDeletingId === String(m.id)} // ★追加
                              className="gap-2 text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault()
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="text-sm">削除</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="z-60">
                            <AlertDialogHeader>
                              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                「{m.title}」を削除すると、計画・実績データも含めて復元できません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => void runDelete(m)}
                                disabled={!onDeleteMaterial || isDeletingId === String(m.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                削除する
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* 編集 */}
                        <DropdownMenuItem
                          className="gap-2"
                          onSelect={(e) => {
                            e.preventDefault()
                            onEditMaterial?.(m)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-sm">編集</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}