// src/app/(private)/project/page-body.tsx
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import ProjectSelectHeader from "@/app/(private)/project/_components/project-select-panel"
import MaterialRecordCalendarPanel from "./_components/mateial-record-calendar-panel"
import ProjectRecordCalendarPanel from "./_components/project-record-calendar-panel"
import MaterialsList from "./_components/materials-list"
import { ProjectEditDialog } from "./_components/project-edit-dialog"
import { ProjectActionButtonRow } from "./_components/project-action-button_panel"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { MaterialRow, MaterialVM } from "@/lib/type/material_type"
import type { unit_type } from "@/lib/type/unit-type"
import { deleteMaterialAction, deleteProjectAction, replanDelayedPlansAction, saveSectionRecordsAction, updateMaterialOrdersAction, updateProjectMetaAction } from "./action"
import { ProjectDetails } from "@/lib/type/project_type"

type Props = {
  projects: ProjectDetails[]
  materialsByProjectSlug: Record<string, MaterialVM[]>
}

function makeMaterialinfo(
  material: MaterialVM,
  project_slug: string
) {
  return {
    id: material.id,
    slug: material.slug,
    title: material.title,
    order: material.order,
    project_id: material.id,
    project_slug: project_slug,
    start_date: material.start_date,
    end_date: material.end_date,
    unit_count: material.unit_count,
    rounds: material.rounds,
    plan_days: material.plan_days,
    actual_days: material.actual_days,
    unit_type: material.unit_type,
  }
}

export function ProjectPageBody({
  projects,
  materialsByProjectSlug,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const projectSlugFromUrl = searchParams.get("project") ?? ""
  const materialSlugFromUrl = searchParams.get("material") ?? ""
  const viewMode = searchParams.get("view") ?? ""


  //　プロジェクト、マテリアル、ビューのオブジェクトを引数に受け取る
  function replaceQuery(urlobject: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const key in urlobject) {
      const value = urlobject[key]
      if (value) params.set(key, value)
      else params.delete(key)
    }

    window.history.replaceState(null, "", `/project?${params.toString()}`)
  }

  // URLで選択されたプロジェクトの情報を取得
  const selectedProject =
    projects.find((project) => project.slug === projectSlugFromUrl)


  const selectedProjectName = selectedProject?.name ?? ""
  const selectedProjectId = selectedProject?.id ?? null
  const materialsInSelectedProject = materialsByProjectSlug[projectSlugFromUrl] ?? []

  let openedMaterial: MaterialRow | null = null

  if (materialSlugFromUrl) {
    let ProjectSlugInUrl = projectSlugFromUrl

    // プロジェクトスラッグがなくてマテリアルスラッグがURLクエリにあるなら逆算でプロジェクトスラッグを取得
    if (!ProjectSlugInUrl) {
      for (const projectSlug in materialsByProjectSlug) {
        const foundMaterial = materialsByProjectSlug[projectSlug].find(
          (material) => material.slug === materialSlugFromUrl
        )
        //教材のオブジェクトがあったらそこで終了
        if (foundMaterial) {
          ProjectSlugInUrl = projectSlug
          break
        }
      }
    }

    //ユーザーがクエリをいじって教材のクエリも存在しないケースがあるのでiｆが必要👇
    if (ProjectSlugInUrl) {
      const foundMaterial = materialsByProjectSlug[ProjectSlugInUrl].find(
        (material) => material.slug === materialSlugFromUrl
      )

      if (foundMaterial) {
        openedMaterial = makeMaterialinfo(foundMaterial, ProjectSlugInUrl)
        //特定のクエリにある教材の細かいすべての情報を開示
      }
    }
  }

  const isProjectView = viewMode === "project"

  //クエリの中に存在しうる教材がある or プロジェクトモードである
  const mobileSheetOpen = !!openedMaterial || isProjectView

  const [isMobile, setIsMobile] = React.useState(false)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")
  const [projectOrder, setProjectOrder] = React.useState<ProjectDetails[]>([])
  const [deletingProjectId, setDeletingProjectId] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isReplanning, setIsReplanning] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")

    const update = () => setIsMobile(mq.matches)
    update()

    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  React.useEffect(() => {
    if (projectSlugFromUrl) return
    if (projects.length === 0) return

    replaceQuery({
      project: projects[0]?.slug ?? null,
      material: null,
      view: null,
    })
  }, [projectSlugFromUrl, projects])

  function openRename() {
    setRenameValue(selectedProjectName)
    setProjectOrder(projects)
    setRenameOpen(true)
  }

  function goEditMaterial(slug: string) {
    router.push(`/material-editor?edit=${slug}`)
  }

  function selectMaterial(material: MaterialRow & { project_slug: string }) {
    const nextIsSame = materialSlugFromUrl === material.slug

    replaceQuery({
      project: material.project_slug,
      material: nextIsSame ? null : material.slug,
      view: nextIsSame ? null : "material",
    })
  }

  function openProjectProgress() {
    const nextIsProjectView = !isProjectView

    replaceQuery({
      project: projectSlugFromUrl || null,
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

  async function deleteProject(project_id: number) {
    const id = String(project_id)

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

  async function deleteMaterial(material_id: number, material_slug?: string) {
    const fd = new FormData()
    fd.set("materialId", String(material_id))
    await deleteMaterialAction(fd)

    if (material_slug && materialSlugFromUrl === material_slug) {
      replaceQuery({
        material: null,
        view: null,
      })
    }

    router.refresh()
  }

  async function replanAllDelayedInProject() {
    if (!projectSlugFromUrl) return

    try {
      setIsReplanning(true)

      const fd = new FormData()
      fd.set("projectSlug", projectSlugFromUrl)
      await replanDelayedPlansAction(fd)

      router.refresh()
    } finally {
      setIsReplanning(false)
    }
  }

  const projectPanel = (
    <ProjectRecordCalendarPanel
      project_name={selectedProjectName}
      materials={materialsInSelectedProject}
      onSelectMaterialSlug={(slug) => {
        const material = materialsInSelectedProject.find((item) => item.slug === slug)
        if (!material) return
        selectMaterial(makeMaterialinfo(material, projectSlugFromUrl))
      }}
    />
  )

  const materialPanel = openedMaterial ? (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1">
        <MaterialRecordCalendarPanel
          title={openedMaterial.title}
          material_id={openedMaterial.id}
          initialActualDays={openedMaterial.actual_days ?? []}
          initialPlanDays={openedMaterial.plan_days ?? []}
          saveSectionRecordsAction={saveSectionRecordsAction}
          onActualDaysSaved={() => router.refresh()}
          range={{
            from: new Date(`${openedMaterial.start_date}T00:00:00`),
            to: new Date(`${openedMaterial.end_date}T00:00:00`),
          }}
          unit_count={openedMaterial.unit_count}
          rounds={openedMaterial.rounds}
          unit_type={openedMaterial.unit_type}
        />
      </div>
    </div>
  ) : null

  const rightPanel = isProjectView ? projectPanel : (materialPanel ?? projectPanel)

  return (
    <div className="flex h-full min-h-0 flex-col space-y-6">
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
        <div className="col-span-1 flex h-full min-h-0 flex-col space-y-3">
          <ProjectSelectHeader
            projects={projects}
            selectedSlug={projectSlugFromUrl}
            onSelectSlug={(slug) => {
              replaceQuery({
                project: slug,
                material: null,
                view: null,
              })
            }}
          />

          <ProjectActionButtonRow
            openRename={openRename}
            toggleProjectProgress={openProjectProgress}
            replanDelayedMaterial={replanAllDelayedInProject}
            isReplanning={isReplanning}
          />

          <div className="min-h-0 flex-1">
            <MaterialsList
              materialsInSelectedProject={materialsInSelectedProject}
              projectName={selectedProjectName}
              selectedMaterialSlug={openedMaterial?.slug ?? null}
              onDeleteMaterial={(material) => deleteMaterial(material.id, material.slug)}
              onSelectMaterial={(material) =>
                selectMaterial(makeMaterialinfo(material, projectSlugFromUrl))
              }
              onEditMaterial={(material) => goEditMaterial(material.slug)}
              onReorderMaterials={async (orders) => {
                if (!projectSlugFromUrl) return

                const fd = new FormData()
                fd.set("projectSlug", projectSlugFromUrl)
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

      <ProjectEditDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        orderProjects={projectOrder}
        setOrderProjects={setProjectOrder}
        selectedSlug={projectSlugFromUrl}
        isSaving={isSaving}
        onSave={saveMeta}
        isDeletingProjectId={deletingProjectId}
        onDeleteProject={deleteProject}
      />

      {/* スマホ画面でカレンダーはシートに表示 */}
      {isMobile && (
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
      )}
    </div>
  )
}