"use client"

import * as React from "react"
import ProjectSelectHeader from "@/app/(private)/project/_components/project-select-header"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import ActualRecordCalendarPanel from "./_components/actual-record-calendar-panel"
import ProjectRecordCalendarPanel from "./_components/project-record-calendar-panel"
import MaterialsList from "./_components/materials-list"
import { useRouter, useSearchParams } from "next/navigation"
import type { MaterialVM, PopupMaterialForMaterialPage } from "@/lib/type/material"
import { ProjectForProjectPage } from "./data"
import { ProjectRenameDialog } from "./_components/project-rename-dialog"
import { ProjectActionButton } from "./_components/project-action-button"
import { UnitType } from "@/lib/type/unit-type"

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

export function ProjectPageBody({
  projects,
  materialsBySlug,
  saveSectionRecordsAction,
  updateProjectMetaAction,
  replanDelayedPlansAction,
  updateMaterialOrdersAction,
  deleteMaterialAction,
  deleteProjectAction,
}: {
  projects: ProjectForProjectPage[]
  materialsBySlug: Record<string, MaterialVM[]>
  saveSectionRecordsAction: (fd: FormData) => Promise<void>
  updateProjectMetaAction: (fd: FormData) => Promise<void>
  replanDelayedPlansAction: (fd: FormData) => Promise<void>
  updateMaterialOrdersAction: (fd: FormData) => Promise<void>
  deleteMaterialAction: (fd: FormData) => Promise<void>
  deleteProjectAction: (fd: FormData) => Promise<void>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qsProject = searchParams.get("project") ?? ""
  const qsMaterial = searchParams.get("material") ?? ""
  const qsView = searchParams.get("view") ?? ""

  const replaceQuery = React.useCallback(
  (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(patch)) {
      if (!value) params.delete(key)
      else params.set(key, value)
    }

    const next = `/project?${params.toString()}`
    window.history.replaceState(null, "", next)
  },
  [searchParams]
)

  const selectedSlug =
    qsProject && projects.some((p) => p.slug === qsProject)
      ? qsProject
      : (projects[0]?.slug ?? "")

  const materials = selectedSlug ? materialsBySlug[selectedSlug] ?? [] : []

  const selectedProject = React.useMemo(
    () => projects.find((p) => p.slug === selectedSlug),
    [projects, selectedSlug]
  )
  const selectedProjectName = selectedProject?.name ?? ""
  const selectedProjectId = selectedProject?.id

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

  const goEditMaterial = React.useCallback(
    (slug: string) => {
      router.push(`/material-editor?edit=${encodeURIComponent(slug)}`)
    },
    [router]
  )

  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false)

  const defaultUnitType: UnitType = "section"
  const defaultUnitLabel = "セクション"

  const openedMaterial = React.useMemo<PopupMaterialForMaterialPage | null>(() => {
    if (!qsMaterial) return null

    const pSlug =
      (qsProject && projects.some((p) => p.slug === qsProject) ? qsProject : "") ||
      materialToProjectSlug[qsMaterial] ||
      ""

    if (!pSlug) return null

    const mats = materialsBySlug[pSlug] ?? []
    const m = mats.find((x) => x.slug === qsMaterial)
    if (!m) return null

    return {
      id: m.id,
      slug: m.slug,
      title: m.title,
      projectSlug: pSlug,
      startDate: m.startDate,
      endDate: m.endDate,
      totalUnits: m.totalUnits,
      lapsTotal: m.lapsTotal,
      planDays: m.planDays,
      actualDays: m.actualDays,
      unitType: m.unitType ?? defaultUnitType,
      unitLabel: m.unitLabel ?? defaultUnitLabel,
    }
  }, [
    qsMaterial,
    qsProject,
    projects,
    materialsBySlug,
    materialToProjectSlug,
  ])

  const projectProgressMode = qsView === "project"

  const toggleSelectMaterial = React.useCallback(
    (m: PopupMaterialForMaterialPage) => {
      const resolvedProjectSlug =
        m.projectSlug ?? materialToProjectSlug[m.slug] ?? selectedSlug

      const nextIsSame = qsMaterial === m.slug

      replaceQuery({
        project: resolvedProjectSlug,
        material: nextIsSame ? null : m.slug,
        view: nextIsSame ? null : "material",
      })

      if (!isDesktop) {
        setMobileSheetOpen(!nextIsSame)
      }
    },
    [materialToProjectSlug, selectedSlug, qsMaterial, replaceQuery, isDesktop]
  )

  const toggleProjectProgress = React.useCallback(() => {
    const next = !projectProgressMode

    replaceQuery({
      project: selectedSlug || null,
      material: null,
      view: next ? "project" : null,
    })

    if (!isDesktop) setMobileSheetOpen(next)
  }, [projectProgressMode, replaceQuery, selectedSlug, isDesktop])

  React.useEffect(() => {
    if (isDesktop) return
    setMobileSheetOpen(!!qsMaterial || qsView === "project")
  }, [isDesktop, qsMaterial, qsView])

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
        unitType: m.unitType ?? "section",
        unitLabel: m.unitLabel ?? "セクション",
      }))}
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
          onActualDaysSaved={() => {
            router.refresh()
          }}
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
          unitLabel={openedMaterial.unitLabel ?? defaultUnitLabel}
          unitType={(openedMaterial.unitType ?? defaultUnitType) as UnitType}
        />
      </div>
    </div>
  ) : null

  const RightPanel = projectProgressMode ? ProjectPanel : (MaterialPanel ?? ProjectPanel)

  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")

  const [orderProjects, setOrderProjects] = React.useState<ProjectForProjectPage[]>([])
  const [isDeletingProjectId, setIsDeletingProjectId] = React.useState<string | null>(null)

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
    async (projectId: number | string) => {
      if (!deleteProjectAction) return
      const idStr = String(projectId)
      try {
        setIsDeletingProjectId(idStr)

        const fd = new FormData()
        fd.set("projectId", idStr)
        await deleteProjectAction(fd)

        setRenameOpen(false)

        if (selectedProjectId && String(selectedProjectId) === idStr) {
          replaceQuery({
            project: null,
            material: null,
            view: null,
          })
        }

        router.refresh()
      } finally {
        setIsDeletingProjectId(null)
      }
    },
    [deleteProjectAction, router, selectedProjectId, replaceQuery]
  )

  const deleteMaterial = React.useCallback(
    async (materialId: number | string, materialSlug?: string) => {
      const fd = new FormData()
      fd.set("materialId", String(materialId))
      await deleteMaterialAction(fd)

      if (materialSlug && qsMaterial === materialSlug) {
        replaceQuery({
          material: null,
          view: null,
        })
      }

      router.refresh()
    },
    [deleteMaterialAction, router, qsMaterial, replaceQuery]
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
      <ProjectRenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        orderProjects={orderProjects}
        setOrderProjects={setOrderProjects}
        selectedSlug={selectedSlug}
        isSaving={isSaving}
        onSave={saveMeta}
        isDeletingProjectId={isDeletingProjectId}
        onDeleteProject={deleteProject}
      />

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

      <div className="grid md:grid-cols-2 flex-1 min-h-0 gap-4">
        <div className="space-y-3 col-span-1 h-full min-h-0 flex flex-col">
          <ProjectSelectHeader
            projects={projects}
            onSelectSlug={(slug) => {
              replaceQuery({
                project: slug,
                material: null,
                view: null,
              })
            }}
            selectedSlug={selectedSlug}
          />

          <ProjectActionButton
            openRename={openRename}
            toggleProjectProgress={toggleProjectProgress}
            replanAllDelayedInProject={replanAllDelayedInProject}
            isReplanning={isReplanning}
          />
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
        </div>

        <div className="hidden md:flex md:col-span-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0">{RightPanel}</div>
        </div>
      </div>
    </div>
  )
}