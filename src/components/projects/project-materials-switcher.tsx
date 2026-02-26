// C:\Users\chiso\nextjs\study-allot\src\components\projects\project-materials-switcher.tsx
"use client"

import * as React from "react"
import ProjectCarousel from "@/components/projects/project-carousel"
import MaterialsList from "@/components/material/materials-list"
import DailyTaskBoard from "@/components/daily-task/daily-task-board"
import type { DayBucket } from "@/app/(private)/daily-task/daily-assignment"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import type { PopupMaterial } from "@/components/daily-task/daily-task-board"

import MaterialCheckTable from "@/app/(private)/(materials)/(material)/material/[slug]/material-check-table"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

type MaterialVM = {
  id: number | string
  title: string
  slug: string
  startDate: string
  endDate: string
  totalUnits: number
  lapsNow: number
  lapsTotal: number
  plannedPct: number
  actualPct: number
}

type SectionLite = { id: number; order: number; title: string }

type ExpandedMaterialVM = {
  matId: number
  planId: number
  rounds: number
  sections: SectionLite[]
  initialRecords: Record<string, string>
  todayISO: string
}

function useIsDesktop(breakpointPx = 768) {
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`)
    const apply = () => setIsDesktop(mq.matches)
    apply()

    if (mq.addEventListener) mq.addEventListener("change", apply)
    else mq.addListener(apply)

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply)
      else mq.removeListener(apply)
    }
  }, [breakpointPx])

  return isDesktop
}

export default function ProjectMaterialsSwitcher({
  projects,
  materialsBySlug,
  expandedByProjectSlug,
  saveSectionRecordsAction,
  dailyTaskDataPromise,
  todayISO,
}: {
  projects: ProjectForCarousel[]
  materialsBySlug: Record<string, MaterialVM[]>
  expandedByProjectSlug: Record<string, Record<string, ExpandedMaterialVM | null>>
  saveSectionRecordsAction: (fd: FormData) => Promise<void>
  dailyTaskDataPromise?: Promise<{ week: DayBucket[]; initialChecked: Record<string, boolean> }>
  todayISO: string
}) {
  const [selectedSlug, setSelectedSlug] = React.useState<string>(projects[0]?.slug ?? "")
  const materials = selectedSlug ? materialsBySlug[selectedSlug] ?? [] : []

  const selectedProject = React.useMemo(() => projects.find((p) => p.slug === selectedSlug), [projects, selectedSlug])
  const selectedProjectName = selectedProject?.name

  const materialToProjectSlug = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const [pSlug, mats] of Object.entries(materialsBySlug ?? {})) {
      for (const m of mats ?? []) {
        map[m.slug] = pSlug
      }
    }
    return map
  }, [materialsBySlug])

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const dragStartYRef = React.useRef<number | null>(null)

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY

    const onMove = (ev: PointerEvent) => {
      const startY = dragStartYRef.current
      if (startY == null) return
      const dy = ev.clientY - startY
      if (dy > 60) {
        setSheetOpen(false)
        cleanup()
      }
    }

    const onUp = () => cleanup()

    const cleanup = () => {
      dragStartYRef.current = null
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
  }

  const isDesktop = useIsDesktop(768)

  const [materialPopupOpen, setMaterialPopupOpen] = React.useState(false)
  const [openedMaterial, setOpenedMaterial] = React.useState<PopupMaterial | null>(null)

  const onSelectMaterial = React.useCallback(
    (m: PopupMaterial) => {
      const resolvedProjectSlug = m.projectSlug ?? materialToProjectSlug[m.slug] ?? selectedSlug
      setOpenedMaterial({ ...m, projectSlug: resolvedProjectSlug })
      setMaterialPopupOpen(true)
    },
    [materialToProjectSlug, selectedSlug]
  )

  React.useEffect(() => {
    setMaterialPopupOpen(false)
    setOpenedMaterial(null)
  }, [selectedSlug])

  const popupProjectSlug =
    openedMaterial?.projectSlug ??
    (openedMaterial ? materialToProjectSlug[openedMaterial.slug] : undefined) ??
    selectedSlug

  const popupProject = React.useMemo(() => projects.find((p) => p.slug === popupProjectSlug), [projects, popupProjectSlug])
  const popupProjectName = popupProject?.name

  const expanded = openedMaterial ? expandedByProjectSlug[popupProjectSlug]?.[openedMaterial.slug] ?? null : null

  const CheckContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 shrink-0">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{openedMaterial?.title ?? "教材"}</div>
          <div className="truncate text-xs text-muted-foreground">{popupProjectName ?? ""}</div>
        </div>
      </div>

      {/* 重要：flex-1 + min-h-0 で「残り領域だけ」スクロール */}
      <div className="flex-1 min-h-0 px-4 py-4">
        {!openedMaterial ? null : !expanded ? (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground"></div>
          </Card>
        ) : (
          <MaterialCheckTable
            materialId={expanded.matId}
            rounds={expanded.rounds}
            sections={expanded.sections}
            initialRecords={expanded.initialRecords}
            todayISO={expanded.todayISO}
            planId={expanded.planId}
            saveAction={saveSectionRecordsAction}
          />
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {isDesktop ? (
        <Dialog open={materialPopupOpen} onOpenChange={setMaterialPopupOpen}>
          <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col min-h-0" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>教材チェック</DialogTitle>
              <DialogDescription>教材のチェック表を表示します。</DialogDescription>
            </DialogHeader>
            {CheckContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={materialPopupOpen} onOpenChange={setMaterialPopupOpen}>
          <SheetContent side="bottom" className="h-[100vh] p-0 rounded-none">
            <SheetHeader className="sr-only">
              <SheetTitle>教材チェック</SheetTitle>
              <SheetDescription>教材のチェック表を表示します。</SheetDescription>
            </SheetHeader>
            {CheckContent}
          </SheetContent>
        </Sheet>
      )}

      {/* md以上：2列（左=Materials / 右=DailyTask） */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-2">
          <ProjectCarousel projects={projects} onSelectSlug={setSelectedSlug} selectedSlug={selectedSlug} />
          <MaterialsList
            materials={materials}
            projectName={selectedProjectName}
            onSelectMaterial={(m) =>
              onSelectMaterial({
                id: m.id,
                slug: m.slug,
                title: m.title,
                projectSlug: selectedSlug,
              })
            }
          />
        </div>
        <div className="hidden md:block">
          {dailyTaskDataPromise ? (
            <DailyTaskBoard dataPromise={dailyTaskDataPromise} todayISO={todayISO} onSelectMaterial={onSelectMaterial} />
          ) : null}
        </div>
      </div>

      {dailyTaskDataPromise ? (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button type="button" className="w-full rounded-xl border bg-card/95 backdrop-blur px-4 py-3 text-sm font-medium shadow">
                デイリータスク
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
              <SheetHeader className="sr-only">
                <SheetTitle>デイリータスク</SheetTitle>
                <SheetDescription>今日のデイリータスク一覧を表示します。</SheetDescription>
              </SheetHeader>

              <div className="h-full px-4 pt-3 pb-4">
                <div
                  className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted"
                  onPointerDown={onHandlePointerDown}
                  style={{ touchAction: "none" }}
                />

                <div className="h-[calc(85vh-56px)] overflow-y-auto pr-1">
                  <DailyTaskBoard dataPromise={dailyTaskDataPromise} todayISO={todayISO} onSelectMaterial={onSelectMaterial} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : null}
    </div>
  )
}