//C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\project-select.tsx

"use client"

import { useMemo, useRef, useState } from "react"
import ProjectSelectToggle from "@/components/project-select-toggle"

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

export default function ProjectSelectHeader({
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

  const items = useMemo(
    () => projects.map((p) => ({ id: p.slug, label: p.name })),
    [projects]
  )

  return (
    <>
    <div className="relative">
      {projects.length === 0 ? (
        <div className="w-full flex justify-center">
          <div className="py-10 text-sm text-muted-foreground">プロジェクトがありません</div>
        </div>
      ) : (
        <div className="bg-background/80 backdrop-blur">
          <ProjectSelectToggle
            items={items}
            selectedId={selectedProject?.slug ?? projects[0]?.slug}
            open={open}
            onOpenChange={setOpen}
            onSelect={(slug) => onSelectSlug?.(slug)}
            triggerHandlers={{
              onClickCapture: (e) => {
                if (longPressedRef.current) {
                  e.preventDefault()
                  e.stopPropagation()
                  longPressedRef.current = false
                }
              },
              onPointerDown: (e) => {
                if (e.pointerType === "mouse" && e.button !== 0) return
                startLongPress(e.clientX, e.clientY)
              },
              onPointerMove: (e) => cancelLongPressIfMoved(e.clientX, e.clientY),
              onPointerUp: () => {
                clearLongPressTimer()
                pressStartRef.current = null
              },
              onPointerCancel: () => {
                clearLongPressTimer()
                pressStartRef.current = null
              },
            }}
          />
        </div>
      )}
    </div>
    </>
    
  )
}