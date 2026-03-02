// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\project-materials-switcher.tsx
"use client"

import * as React from "react"
import ProjectCarousel from "@/app/(private)/project/project-select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProjectPageButton } from "@/components/new-add-button"
import { BookCheck, CalendarSync, Eraser, Pen, SquareCheckBig, Trash2 } from "lucide-react"
import ActualRecordCalendarPanel from "./actual-record-calendar-panel"
import ProjectRecordCalendarPanel from "./project-record-calendar-panel"
import MaterialsList from "./materials-list"
import { useRouter } from "next/navigation"

import type { MaterialVM, UnitType } from "@/lib/type/material"
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog"

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

type ExpandedMaterialVM = null

type PopupMaterial = {
  id: number | string
  slug: string
  title: string
  projectSlug?: string
  startDate?: string
  endDate?: string
  totalUnits?: number
  lapsTotal?: number
  planDays?: number[]
  actualDays?: number[]
  unitType?: UnitType
  unitLabel?: string
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
  saveSectionRecordsAction,
  updateProjectMetaAction,
  replanDelayedPlansAction,
  updateMaterialOrdersAction,
  deleteMaterialAction, // ★追加
  deleteProjectAction,  // ★追加
}: {
  projects: ProjectForCarousel[]
  materialsBySlug: Record<string, MaterialVM[]>
  expandedByProjectSlug: Record<string, Record<string, ExpandedMaterialVM | null>>
  saveSectionRecordsAction: (fd: FormData) => Promise<void>
  updateProjectMetaAction: (fd: FormData) => Promise<void>
  replanDelayedPlansAction: (fd: FormData) => Promise<void>
  updateMaterialOrdersAction: (fd: FormData) => Promise<void>
  deleteMaterialAction: (fd: FormData) => Promise<void> // ★追加
  deleteProjectAction: (fd: FormData) => Promise<void>  // ★追加
}) {
  const router = useRouter()
  const [selectedSlug, setSelectedSlug] = React.useState<string>(
    projects[0]?.slug ?? ""
  )
  const materials = selectedSlug ? materialsBySlug[selectedSlug] ?? [] : []

  const selectedProject = React.useMemo(
    () => projects.find((p) => p.slug === selectedSlug),
    [projects, selectedSlug]
  )
  const selectedProjectName = selectedProject?.name ?? ""
  const selectedProjectId = selectedProject?.id

  React.useEffect(() => {
    if (!selectedSlug && projects[0]?.slug) setSelectedSlug(projects[0].slug)
  }, [projects, selectedSlug])

  const materialToProjectSlug = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const [pSlug, mats] of Object.entries(materialsBySlug ?? {})) {
      for (const m of mats ?? []) {
        map[m.slug] = pSlug
      }
    }
    return map
  }, [materialsBySlug])

  const isDesktop = useIsDesktop(768)

  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false)
  const [openedMaterial, setOpenedMaterial] =
    React.useState<PopupMaterial | null>(null)

  const [projectProgressMode, setProjectProgressMode] = React.useState(false)

  const toggleSelectMaterial = React.useCallback(
    (m: PopupMaterial) => {
      const resolvedProjectSlug =
        m.projectSlug ?? materialToProjectSlug[m.slug] ?? selectedSlug

      setOpenedMaterial((prev) => {
        const nextIsSame = prev?.slug === m.slug
        const next = nextIsSame ? null : { ...m, projectSlug: resolvedProjectSlug }
        setProjectProgressMode(false)
        if (!isDesktop) {
          setMobileSheetOpen(!nextIsSame)
        }
        return next
      })
    },
    [materialToProjectSlug, selectedSlug, isDesktop]
  )

  const toggleProjectProgress = React.useCallback(() => {
    // プロジェクト進捗を見るときは教材パネルを閉じる
    setOpenedMaterial(null)

    setProjectProgressMode((prev) => {
      const next = !prev
      if (!isDesktop) setMobileSheetOpen(next) // mobileだけSheetを開く
      return next
    })
  }, [isDesktop])

  React.useEffect(() => {
    setMobileSheetOpen(false)
    setOpenedMaterial(null)
    setProjectProgressMode(false)
  }, [selectedSlug])

  const defaultUnitType: UnitType = "section"
  const defaultUnitLabel = "セクション"
  const projectUnitType: UnitType = materials[0]?.unitType ?? defaultUnitType
  const projectUnitLabel = materials[0]?.unitLabel ?? defaultUnitLabel

  const ProjectPanel = (
    <ProjectRecordCalendarPanel
      projectName={selectedProjectName}
      materials={materials.map((m) => ({
        slug: m.slug,
        title: m.title,
        startDate: m.startDate,
        endDate: m.endDate,
        totalUnits: m.totalUnits,
        lapsTotal: m.lapsTotal,
        planDays: m.planDays,
        actualDays: m.actualDays,
      }))}
      unitType={projectUnitType}
      unitLabel={projectUnitLabel}
      onSelectMaterialSlug={(slug) => {
        const m = materials.find((x) => x.slug === slug)
        if (!m) return
        toggleSelectMaterial({
          id: m.id,
          slug: m.slug,
          title: m.title,
          projectSlug: selectedSlug,
          startDate: m.startDate,
          endDate: m.endDate,
          totalUnits: m.totalUnits,
          lapsTotal: m.lapsTotal,
          planDays: m.planDays,
          actualDays: m.actualDays,
          // ★追加：教材ごとの unitType/unitLabel を渡す
          unitType: m.unitType ?? defaultUnitType,
          unitLabel: m.unitLabel ?? defaultUnitLabel,
        })
      }}
    />
  )

  const MaterialPanel = openedMaterial ? (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <div className="flex-1 min-h-0">
        <ActualRecordCalendarPanel
          title={openedMaterial.title}
          materialId={openedMaterial.id}
          initialActualDays={openedMaterial.actualDays ?? []}
          initialPlanDays={openedMaterial.planDays ?? []}
          saveSectionRecordsAction={saveSectionRecordsAction}
          range={{
            from: openedMaterial.startDate
              ? new Date(`${openedMaterial.startDate}T00:00:00`)
              : undefined,
            to: openedMaterial.endDate
              ? new Date(`${openedMaterial.endDate}T00:00:00`)
              : undefined,
          }}
          unitCount={openedMaterial.totalUnits ?? 0}
          laps={openedMaterial.lapsTotal ?? 0}
          // ★変更：openedMaterial 側の unitLabel / unitType を使う（= DBに応じて表示が変わる）
          unitLabel={openedMaterial.unitLabel ?? defaultUnitLabel}
          unitType={(openedMaterial.unitType ?? defaultUnitType) as UnitType}
        />
      </div>
    </div>
  ) : null

  const RightPanel = projectProgressMode ? ProjectPanel : (MaterialPanel ?? ProjectPanel)

  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")
  const [isSavingRename, setIsSavingRename] = React.useState(false)

  const [orderProjects, setOrderProjects] = React.useState<ProjectForCarousel[]>([])
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = React.useState(false)

  React.useEffect(() => {
    setOrderProjects(projects)
  }, [projects])

  const openRename = () => {
    setRenameValue(selectedProjectName)
    setOrderProjects(projects)
    setRenameOpen(true)
  }

  const [isSaving, setIsSaving] = React.useState(false)

  const saveMeta = async () => {
    if (!selectedProjectId) return

    const nextName = renameValue.trim()
    if (!nextName) return
    if (orderProjects.length === 0) return

    try {
      setIsSaving(true)

      const ordersPayload = orderProjects.map((p, idx) => ({
        projectId: Number(p.id),
        order: idx,
      }))

      const fd = new FormData()
      fd.set("projectId", String(selectedProjectId))
      fd.set("projectName", nextName)
      fd.set("orders", JSON.stringify(ordersPayload))

      await updateProjectMetaAction(fd)
      setRenameOpen(false)
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProject = React.useCallback(
  async (projectId: number | string, projectSlug: string) => {
    const fd = new FormData()
    fd.set("projectId", String(projectId))
    await deleteProjectAction(fd)

    // いま選択中プロジェクトを消したら、先頭に逃がす
    if (selectedSlug === projectSlug) {
      const next = projects.find((p) => p.slug !== projectSlug)?.slug ?? ""
      setSelectedSlug(next)
      setOpenedMaterial(null)
      setProjectProgressMode(false)
      setMobileSheetOpen(false)
    }

    router.refresh()
  },
  [deleteProjectAction, router, selectedSlug, projects]
)

  const goEditMaterial = React.useCallback(
    (slug: string) => {
      router.push(`/new-add?edit=${encodeURIComponent(slug)}`)
    },
    [router]
  )
  const deleteMaterial = React.useCallback(
    async (materialId: number | string, materialSlug?: string) => {
      const fd = new FormData()
      fd.set("materialId", String(materialId))
      await deleteMaterialAction(fd)

      // 開いてた教材が消えたら閉じる
      if (materialSlug && openedMaterial?.slug === materialSlug) {
        setOpenedMaterial(null)
        setProjectProgressMode(false)
      }

      router.refresh()
    },
    [deleteMaterialAction, router, openedMaterial?.slug]
  )

  const [isReplanning, setIsReplanning] = React.useState(false)

  const replanAllDelayedInProject = async () => {
    if (!selectedSlug) return
    try {
      setIsReplanning(true)
      const fd = new FormData()
      fd.set("projectSlug", selectedSlug)
      await replanDelayedPlansAction(fd)
      router.refresh()
    } finally {
      setIsReplanning(false)
    }
  }

  return (
    <div className="space-y-6 min-h-0 h-full flex flex-col">
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>プロジェクト名を変更</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />

            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">プロジェクトの順番</div>
              <div className="text-xs text-muted-foreground mb-2">
                ドラッグして並び替え
              </div>

              <div className="space-y-2">
                {orderProjects.map((p) => {
  const id = String(p.id)
  const isCurrent = p.slug === selectedSlug

  return (
    <div
      key={id}
      draggable
      onDragStart={() => setDragId(id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (!dragId || dragId === id) return
        setOrderProjects((prev) => {
          const from = prev.findIndex((x) => String(x.id) === dragId)
          const to = prev.findIndex((x) => String(x.id) === id)
          if (from < 0 || to < 0) return prev
          const next = [...prev]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          return next
        })
        setDragId(null)
      }}
      onDragEnd={() => setDragId(null)}
      className={[
        "flex items-center justify-between gap-3",
        "rounded-md border px-3 py-2 bg-muted",
        "cursor-grab active:cursor-grabbing",
        dragId === id ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="min-w-0 flex items-center gap-2">
        <div className="text-sm font-medium truncate">{p.name}</div>
        {isCurrent ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-background text-muted-foreground">
            選択中
          </span>
        ) : null}
      </div>

      <div
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              aria-label="プロジェクトを削除"
              title="削除"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                「{p.name}」を削除すると、プロジェクト内の教材・計画・実績も含めて復元できません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void deleteProject(p.id, p.slug)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
})}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={isSaving}>
                キャンセル
              </Button>
              <Button onClick={saveMeta} disabled={isSaving || !renameValue.trim() || orderProjects.length === 0}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!isDesktop ? (
        <Sheet modal={false} open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
            <SheetHeader className="sr-only">
              <SheetTitle>実績入力</SheetTitle>
              <SheetDescription>教材またはプロジェクトのカレンダーを表示します。</SheetDescription>
            </SheetHeader>

            <div className="h-full p-4 overflow-y-auto">{RightPanel}</div>
          </SheetContent>
        </Sheet>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 flex-1 min-h-0 gap-6">
        <div className="space-y-3 col-span-1 h-full min-h-0 flex flex-col">
          <ProjectCarousel projects={projects} onSelectSlug={setSelectedSlug} selectedSlug={selectedSlug} />

          <div className="grid grid-cols-2 sm:grid-cols-4 sm:justify-start gap-2 items-center">
            <ProjectPageButton ariaLabel="プロジェクトを編集" onClick={openRename}>
              <Eraser className="h-7 w-7" />
              <div className="">プロジェクト編集</div>
            </ProjectPageButton>

            <ProjectPageButton ariaLabel="プロジェクトの進捗" onClick={toggleProjectProgress}>
              <SquareCheckBig className="h-7 w-7" />
              <div className="">プロジェクト進捗</div>
            </ProjectPageButton>

            <ProjectPageButton
              ariaLabel="計画の再配分"
              onClick={replanAllDelayedInProject}
            >
              <CalendarSync className="h-7 w-7" />
              <div className="">{isReplanning ? "再配分中...." : "計画の再配分"}</div>
            </ProjectPageButton>

            <ProjectPageButton ariaLabel="本日タスク完了" onClick={toggleProjectProgress}>
              <BookCheck className="h-7 w-7" />
              <div className="">本日タスク完了</div>
            </ProjectPageButton>
          </div>

          <div className="flex-1 min-h-0">
            <MaterialsList
              materials={materials}
              projectName={selectedProjectName}
              selectedMaterialSlug={openedMaterial?.slug ?? null}
              onDeleteMaterial={async (m) => {
                await deleteMaterial(m.id, m.slug)
              }}
              onSelectMaterial={(m) =>
                toggleSelectMaterial({
                  id: m.id,
                  slug: m.slug,
                  title: m.title,
                  projectSlug: selectedSlug,
                  startDate: m.startDate,
                  endDate: m.endDate,
                  totalUnits: m.totalUnits,
                  lapsTotal: m.lapsTotal,
                  planDays: m.planDays,
                  actualDays: m.actualDays,
                  unitType: m.unitType ?? defaultUnitType,
                  unitLabel: m.unitLabel ?? defaultUnitLabel,
                })
              }
              onEditMaterial={(m) => goEditMaterial(m.slug)}
              onReorderMaterials={async (orders) => {
                if (!selectedSlug) return
                const fd = new FormData()
                fd.set("projectSlug", selectedSlug)
                fd.set("orders", JSON.stringify(orders))
                await updateMaterialOrdersAction(fd)
                router.refresh()
              }}
            />
          </div>

          <div className="w-full flex justify-end">
            <ProjectPageButton ariaLabel="教材を新規追加" href="/new-add">
              <Pen className="h-7 w-7" />
              <div className="">新規教材追加</div>
            </ProjectPageButton>
          </div>
        </div>

        <div className="hidden md:flex md:col-span-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0">{RightPanel}</div>
        </div>

        <div className="hidden lg:block" />
      </div>
    </div>
  )
}