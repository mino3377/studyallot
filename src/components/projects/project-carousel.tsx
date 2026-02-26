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
        </div>
      )}
    </div>
  )
}