// src/app/(private)/project/page-body.tsx
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import ProjectSelectHeader from "@/app/(private)/project/_components/project-select-header"
import ActualRecordCalendarPanel from "./_components/actual-record-calendar-panel"
import ProjectRecordCalendarPanel from "./_components/project-record-calendar-panel"
import MaterialsList from "./_components/materials-list"
import { ProjectRenameDialog } from "./_components/project-rename-dialog"
import { ProjectActionButton } from "./_components/project-action-button"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { MaterialVM, PopupMaterialForMaterialPage } from "@/lib/type/material"
import type { UnitType } from "@/lib/type/unit-type"
import type { ProjectForProjectPage } from "./data"

type Props = {
  projects: ProjectForProjectPage[]
  materialsBySlug: Record<string, MaterialVM[]>
  saveSectionRecordsAction: (fd: FormData) => Promise<void>
  updateProjectMetaAction: (fd: FormData) => Promise<void>
  replanDelayedPlansAction: (fd: FormData) => Promise<void>
  updateMaterialOrdersAction: (fd: FormData) => Promise<void>
  deleteMaterialAction: (fd: FormData) => Promise<void>
  deleteProjectAction: (fd: FormData) => Promise<void>
}

function makePopupMaterial(
  material: MaterialVM,
  projectSlug: string
): PopupMaterialForMaterialPage {
  return {
    id: material.id,
    slug: material.slug,
    title: material.title,
    projectSlug,
    startDate: material.startDate,
    endDate: material.endDate,
    totalUnits: material.totalUnits,
    lapsTotal: material.lapsTotal,
    planDays: material.planDays,
    actualDays: material.actualDays,
    unitType: material.unitType,
    unitLabel: material.unitLabel,
  }
}

function makeProjectPanelMaterial(material: MaterialVM) {
  return {
    slug: material.slug,
    title: material.title,
    startDate: material.startDate,
    endDate: material.endDate,
    totalUnits: material.totalUnits,
    lapsTotal: material.lapsTotal,
    planDays: material.planDays,
    actualDays: material.actualDays,
    unitType: material.unitType ?? null,
    unitLabel: material.unitLabel ?? null,
  }
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
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const projectSlugFromUrl = searchParams.get("project") ?? ""
  const materialSlugFromUrl = searchParams.get("material") ?? ""
  const viewMode = searchParams.get("view") ?? ""

  function replaceQuery(values: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const key in values) {
      const value = values[key]
      if (value) params.set(key, value)
      else params.delete(key)
    }

    window.history.replaceState(null, "", `/project?${params.toString()}`)
  }

  let selectedProjectSlug = ""
  if (projects.some((project) => project.slug === projectSlugFromUrl)) {
    selectedProjectSlug = projectSlugFromUrl
  } else {
    selectedProjectSlug = projects[0]?.slug ?? ""
  }

  const selectedProject =
    projects.find((project) => project.slug === selectedProjectSlug) ?? null

  const selectedProjectName = selectedProject?.name ?? ""
  const selectedProjectId = selectedProject?.id ?? null
  const materials = materialsBySlug[selectedProjectSlug] ?? []

  let openedMaterial: PopupMaterialForMaterialPage | null = null

  if (materialSlugFromUrl) {
    let materialProjectSlug = projectSlugFromUrl

    if (!materialProjectSlug) {
      for (const projectSlug in materialsBySlug) {
        const found = materialsBySlug[projectSlug]?.find(
          (material) => material.slug === materialSlugFromUrl
        )
        if (found) {
          materialProjectSlug = projectSlug
          break
        }
      }
    }

    if (materialProjectSlug) {
      const foundMaterial = materialsBySlug[materialProjectSlug]?.find(
        (material) => material.slug === materialSlugFromUrl
      )

      if (foundMaterial) {
        openedMaterial = makePopupMaterial(foundMaterial, materialProjectSlug)
      }
    }
  }

  const isProjectView = viewMode === "project"
  const mobileSheetOpen = !!openedMaterial || isProjectView

  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")
  const [projectOrder, setProjectOrder] = React.useState<ProjectForProjectPage[]>([])
  const [deletingProjectId, setDeletingProjectId] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isReplanning, setIsReplanning] = React.useState(false)

  function openRename() {
    setRenameValue(selectedProjectName)
    setProjectOrder(projects)
    setRenameOpen(true)
  }

  function goEditMaterial(slug: string) {
    router.push(`/material-editor?edit=${encodeURIComponent(slug)}`)
  }

  function selectMaterial(material: PopupMaterialForMaterialPage) {
    const nextIsSame = materialSlugFromUrl === material.slug

    replaceQuery({
      project: material.projectSlug,
      material: nextIsSame ? null : material.slug,
      view: nextIsSame ? null : "material",
    })
  }

  function openProjectProgress() {
    const nextIsProjectView = !isProjectView

    replaceQuery({
      project: selectedProjectSlug || null,
      material: null,
      view: nextIsProjectView ? "project" : null,
    })
  }

  async function saveMeta() {
    if (!selectedProjectId) return

    const nextName = renameValue.trim()
    if (!nextName) return
    if (projectOrder.length === 0) return

    try {
      setIsSaving(true)

      const fd = new FormData()
      fd.set("projectId", String(selectedProjectId))
      fd.set("projectName", nextName)
      fd.set(
        "orders",
        JSON.stringify(
          projectOrder.map((project, index) => ({
            projectId: Number(project.id),
            order: index,
          }))
        )
      )

      await updateProjectMetaAction(fd)
      setRenameOpen(false)
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteProject(projectId: number | string) {
    const id = String(projectId)

    try {
      setDeletingProjectId(id)

      const fd = new FormData()
      fd.set("projectId", id)
      await deleteProjectAction(fd)

      setRenameOpen(false)

      if (String(selectedProjectId) === id) {
        replaceQuery({
          project: null,
          material: null,
          view: null,
        })
      }

      router.refresh()
    } finally {
      setDeletingProjectId(null)
    }
  }

  async function deleteMaterial(materialId: number | string, materialSlug?: string) {
    const fd = new FormData()
    fd.set("materialId", String(materialId))
    await deleteMaterialAction(fd)

    if (materialSlug && materialSlugFromUrl === materialSlug) {
      replaceQuery({
        material: null,
        view: null,
      })
    }

    router.refresh()
  }

  async function replanAllDelayedInProject() {
    if (!selectedProjectSlug) return

    try {
      setIsReplanning(true)

      const fd = new FormData()
      fd.set("projectSlug", selectedProjectSlug)
      await replanDelayedPlansAction(fd)

      router.refresh()
    } finally {
      setIsReplanning(false)
    }
  }

  const projectPanel = (
    <ProjectRecordCalendarPanel
      projectName={selectedProjectName}
      materials={materials.map(makeProjectPanelMaterial)}
      onSelectMaterialSlug={(slug) => {
        const material = materials.find((item) => item.slug === slug)
        if (!material) return
        selectMaterial(makePopupMaterial(material, selectedProjectSlug))
      }}
    />
  )

  const materialPanel = openedMaterial ? (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1">
        <ActualRecordCalendarPanel
          title={openedMaterial.title}
          materialId={openedMaterial.id}
          initialActualDays={openedMaterial.actualDays ?? []}
          initialPlanDays={openedMaterial.planDays ?? []}
          saveSectionRecordsAction={saveSectionRecordsAction}
          onActualDaysSaved={() => router.refresh()}
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
          unitLabel={openedMaterial.unitLabel ?? "セクション"}
          unitType={(openedMaterial.unitType ?? "section") as UnitType}
        />
      </div>
    </div>
  ) : null

  const rightPanel = isProjectView ? projectPanel : (materialPanel ?? projectPanel)

  return (
    <div className="flex h-full min-h-0 flex-col space-y-6">
      <ProjectRenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        orderProjects={projectOrder}
        setOrderProjects={setProjectOrder}
        selectedSlug={selectedProjectSlug}
        isSaving={isSaving}
        onSave={saveMeta}
        isDeletingProjectId={deletingProjectId}
        onDeleteProject={deleteProject}
      />

      <div className="md:hidden">
        <Sheet
          modal={false}
          open={mobileSheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              replaceQuery({
                material: null,
                view: null,
              })
            }
          }}
        >
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>実績入力</SheetTitle>
              <SheetDescription>
                教材またはプロジェクトのカレンダーを表示します。
              </SheetDescription>
            </SheetHeader>

            <div className="h-full overflow-y-auto p-4">{rightPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
        <div className="col-span-1 flex h-full min-h-0 flex-col space-y-3">
          <ProjectSelectHeader
            projects={projects}
            selectedSlug={selectedProjectSlug}
            onSelectSlug={(slug) => {
              replaceQuery({
                project: slug,
                material: null,
                view: null,
              })
            }}
          />

          <ProjectActionButton
            openRename={openRename}
            toggleProjectProgress={openProjectProgress}
            replanAllDelayedInProject={replanAllDelayedInProject}
            isReplanning={isReplanning}
          />

          <div className="min-h-0 flex-1">
            <MaterialsList
              materials={materials}
              projectName={selectedProjectName}
              selectedMaterialSlug={openedMaterial?.slug ?? null}
              onDeleteMaterial={(material) => deleteMaterial(material.id, material.slug)}
              onSelectMaterial={(material) =>
                selectMaterial(makePopupMaterial(material, selectedProjectSlug))
              }
              onEditMaterial={(material) => goEditMaterial(material.slug)}
              onReorderMaterials={async (orders) => {
                if (!selectedProjectSlug) return

                const fd = new FormData()
                fd.set("projectSlug", selectedProjectSlug)
                fd.set("orders", JSON.stringify(orders))
                await updateMaterialOrdersAction(fd)

                router.refresh()
              }}
            />
          </div>
        </div>

        <div className="hidden min-h-0 flex-col md:flex">
          <div className="min-h-0 flex-1">{rightPanel}</div>
        </div>
      </div>
    </div>
  )
}