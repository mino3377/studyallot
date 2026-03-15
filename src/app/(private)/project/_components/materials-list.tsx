// C:\Users\chiso\nextjs\study-allot\src\(private)/project/materials-list.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import ProgressRateCard from "@/app/(private)/project/_components/material-progress-rate"
import { CheckSquare, Pencil, GripVertical, Trash2 } from "lucide-react"
import type { MaterialVM } from "@/lib/type/material_type"
import { taskLabelRange, taskLabelSingle } from "@/lib/unit-wording"

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

import { unit_type } from "@/lib/type/unit-type"

type Props = {
  materialsInSelectedProject: MaterialVM[]
  projectName?: string
  selectedMaterialSlug?: string | null
  onSelectMaterial?: (m: MaterialVM) => void
  onEditMaterial?: (m: MaterialVM) => void
  onDeleteMaterial?: (m: MaterialVM) => Promise<void> | void
  onReorderMaterials?: (
    orders: { materialId: number; order: number }[]
  ) => Promise<void> | void
}

function getTodayISOJST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function toDate(value?: string) {
  if (!value) return null
  return new Date(`${value.slice(0, 10)}T00:00:00`)
}

function toSafeCounts(arr?: number[]) {
  if (!Array.isArray(arr)) return []
  return arr.map((v) => (Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0))
}

function getTodayIndex(m: MaterialVM) {
  const start = toDate(m.start_date)
  const end = toDate(m.end_date)
  const today = toDate(getTodayISOJST())

  if (!start || !end || !today) return -1

  const msPerDay = 24 * 60 * 60 * 1000
  const diff = Math.floor((today.getTime() - start.getTime()) / msPerDay)
  const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1

  if (totalDays <= 0) return -1
  if (diff < 0 || diff >= totalDays) return -1

  return diff
}

function sumUntil(arr: number[], endExclusive: number) {
  let total = 0
  for (let i = 0; i < endExclusive; i++) {
    total += arr[i] ?? 0
  }
  return total
}

function getTaskLabel(unit_type: unit_type, index: number, unit_count: number) {
  const unitNo = (index % unit_count) + 1
  const lap = Math.floor(index / unit_count) + 1
  return { unitNo, lap, label: taskLabelSingle(unit_type, unitNo, lap) }
}

function buildTodayTaskText(m: MaterialVM) {
  const idx = getTodayIndex(m)
  const planDays = toSafeCounts(m.plan_days)
  const unit_count = Number(m.unit_count ?? 0)
  const rounds = Number(m.rounds ?? 0)
  const totalTasks = unit_count * rounds
  const unit_type: unit_type = m.unit_type

  if (idx < 0 || planDays.length === 0) return "今日のタスクなし"

  const todayCount = planDays[idx] ?? 0
  if (todayCount <= 0 || unit_count <= 0 || rounds <= 0) return "今日のタスクなし"

  const startTaskIndex = sumUntil(planDays, idx)
  const endTaskIndex = Math.min(totalTasks - 1, startTaskIndex + todayCount - 1)

  if (startTaskIndex > endTaskIndex || startTaskIndex >= totalTasks) {
    return "今日のタスクなし"
  }

  const start = getTaskLabel(unit_type, startTaskIndex, unit_count)
  const end = getTaskLabel(unit_type, endTaskIndex, unit_count)

  if (unit_type === "page" && start.lap === end.lap && start.unitNo !== end.unitNo) {
    return taskLabelRange(unit_type, start.unitNo, end.unitNo, start.lap)
  }

  if (startTaskIndex === endTaskIndex) {
    return start.label
  }

  return `${start.label} ~ ${end.label}`
}

function calcDeltaUntilToday(m: MaterialVM) {
  const idx = getTodayIndex(m)
  const planDays = toSafeCounts(m.plan_days)
  const actualDays = toSafeCounts(m.actual_days)

  const hasData = planDays.length > 0 || actualDays.length > 0
  if (idx < 0 || !hasData) return { delta: 0, hasData }

  const planned = sumUntil(planDays, idx + 1)
  const actual = sumUntil(actualDays, idx + 1)

  return { delta: planned - actual, hasData: true }
}

export default function MaterialsList({
  materialsInSelectedProject,
  onSelectMaterial,
  onEditMaterial,
  onDeleteMaterial,
  selectedMaterialSlug,
  onReorderMaterials,
}: Props) {
  const hasMaterials = materialsInSelectedProject.length > 0

  const [ordered, setOrdered] = React.useState<MaterialVM[]>(materialsInSelectedProject)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = React.useState(false)

  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (dragId) return
    setOrdered(materialsInSelectedProject)
  }, [materialsInSelectedProject, dragId])

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
        if (!moved) return prev
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
              アクション
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
              アクション
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

                      <DropdownMenuContent
                        align="center"
                        side="bottom"
                        sideOffset={6}
                        className="p-2 w-auto min-w-0"
                      >
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                disabled={!onDeleteMaterial || isDeletingId === String(m.id)}
                                className="flex flex-col items-center justify-center px-4 py-2 text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mb-1" />
                                <span className="text-xs">削除</span>
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

                          <DropdownMenuItem
                            className="flex flex-col items-center justify-center px-4 py-2"
                            onSelect={(e) => {
                              e.preventDefault()
                              onEditMaterial?.(m)
                            }}
                          >
                            <Pencil className="h-4 w-4 mb-1" />
                            <span className="text-xs">編集</span>
                          </DropdownMenuItem>
                        </div>
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