// C:\Users\chiso\nextjs\study-allot\src\components\projects\project-carousel.tsx
"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarDays, Check, Pencil, Trash2 } from "lucide-react"
import ProgressRateCard from "@/components/infocards/progress-rate-card"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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

import { deleteProjectAction } from "@/app/(private)/(projects)/project/actions"

type ProjectForCarousel = {
  id: number | string
  slug: string
  name: string
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  actualPct: number
  plannedPct: number
}

export default function ProjectCarousel({
  projects,
  onSelectSlug,
  selectedSlug,
}: {
  projects: ProjectForCarousel[]
  onSelectSlug?: (slug: string) => void
  selectedSlug?: string
}) {
  const [open, setOpen] = useState(false)

  // ✅ 長押し→編集/削除 sheet
  const [actionOpen, setActionOpen] = useState(false)

  const longPressTimerRef = useRef<number | null>(null)
  const longPressedRef = useRef(false)
  const pressStartRef = useRef<{ x: number; y: number } | null>(null)

  const selectedIndex = useMemo(() => {
    if (!selectedSlug) return -1
    return projects.findIndex((p) => p.slug === selectedSlug)
  }, [projects, selectedSlug])

  const selectedProject = selectedIndex >= 0 ? projects[selectedIndex] : projects[0]

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const startLongPress = (x: number, y: number) => {
    clearLongPressTimer()
    longPressedRef.current = false
    pressStartRef.current = { x, y }

    longPressTimerRef.current = window.setTimeout(() => {
      longPressedRef.current = true
      setActionOpen(true)
    }, 450)
  }

  const cancelLongPressIfMoved = (x: number, y: number) => {
    const s = pressStartRef.current
    if (!s) return
    const dx = Math.abs(x - s.x)
    const dy = Math.abs(y - s.y)
    if (dx > 8 || dy > 8) clearLongPressTimer()
  }

  return (
    <div className="relative">
      {projects.length === 0 ? (
        <div className="w-full flex justify-center">
          <div className="py-10 text-sm text-muted-foreground">プロジェクトがありません</div>
        </div>
      ) : (
        <div className="sticky top-0 z-40 -mx-3 py-2 bg-background/80 backdrop-blur">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Card
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setOpen((v) => !v)
                }}
                // ✅ 長押し直後のクリックでPopoverが開かないようにする
                onClickCapture={(e) => {
                  if (longPressedRef.current) {
                    e.preventDefault()
                    e.stopPropagation()
                    longPressedRef.current = false
                    return
                  }
                }}
                onPointerDown={(e) => {
                  if (e.pointerType === "mouse" && e.button !== 0) return
                  startLongPress(e.clientX, e.clientY)
                }}
                onPointerMove={(e) => cancelLongPressIfMoved(e.clientX, e.clientY)}
                onPointerUp={() => {
                  clearLongPressTimer()
                  pressStartRef.current = null
                }}
                onPointerCancel={() => {
                  clearLongPressTimer()
                  pressStartRef.current = null
                }}
                className={[
                  "p-3 cursor-pointer transition-all duration-200",
                  "shadow-md hover:shadow-lg",
                  "ring-1 ring-emerald-500/15 hover:ring-emerald-500/25",
                  "bg-card hover:bg-muted/20",
                ].join(" ")}
              >
                <div className="space-y-1">
                  <div className="flex items-center text-base font-medium">{selectedProject?.name}</div>

                  <div className="flex-wrap inline-flex items-center gap-1.5 text-muted-foreground text-xs">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {selectedProject?.period.from} — {selectedProject?.period.to}
                  </div>

                  <ProgressRateCard
                    avgActualPct={selectedProject?.actualPct ?? 0}
                    avgPlannedPct={selectedProject?.plannedPct ?? 0}
                  />
                </div>
              </Card>
            </PopoverTrigger>

            <PopoverContent align="center" side="bottom" className="w-[min(520px,calc(100vw-1.5rem))] p-2">
              <div className="max-h-[55vh] overflow-auto">
                <div className="space-y-1">
                  {projects.map((p) => {
                    const active = selectedSlug === p.slug
                    return (
                      <button
                        key={String(p.id)}
                        type="button"
                        onClick={() => {
                          onSelectSlug?.(p.slug)
                          setOpen(false)
                        }}
                        className={[
                          "w-full flex items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors",
                          active ? "bg-emerald-500/15" : "hover:bg-muted",
                        ].join(" ")}
                      >
                        <span className="min-w-0 truncate">{p.name}</span>
                        {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* ✅ 長押し後に出す：編集/削除 */}
          <Sheet open={actionOpen} onOpenChange={setActionOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-base">プロジェクト操作</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-2">
                <div className="text-sm font-semibold">{selectedProject?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedProject?.period.from} — {selectedProject?.period.to}
                </div>

                <div className="mt-4 grid gap-2">
                  <Button asChild variant="secondary" className="justify-start gap-2">
                    <Link href={`/project/${selectedProject?.slug}/edit`} onClick={() => setActionOpen(false)}>
                      <Pencil className="h-4 w-4" />
                      編集する
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="justify-start gap-2">
                        <Trash2 className="h-4 w-4" />
                        削除する
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          このプロジェクトを削除すると、関連する教材も削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>

                        <form
                          action={deleteProjectAction}
                          onSubmit={() => {
                            setActionOpen(false)
                          }}
                        >
                          <input type="hidden" name="projectId" value={String(selectedProject?.id ?? "")} />
                          <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700">
                            削除する
                          </AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="pt-2">
                  <Button variant="ghost" className="w-full" onClick={() => setActionOpen(false)}>
                    閉じる
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}