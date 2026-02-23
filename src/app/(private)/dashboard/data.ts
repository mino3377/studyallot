import "server-only"
import { cache } from "react"
import { fetchProjects, fetchMaterials, fetchPlans, type ProjectLite, type MaterialRow, type PlanRow } from "./queries"

export type GanttItem = {
  id: number
  title: string
  start: string
  end: string
  projectSlug: string
  projectName: string
}

export type DashboardData = {
  projects: ProjectLite[]
  items: GanttItem[]
  filterProjectSlug: string
  hitProjectId: number | null
  materialsCount: number
}

export const getDashboardData = cache(async (userId: string, projectFilterSlug?: string): Promise<DashboardData> => {
  const projects = await fetchProjects(userId)
  let hitProjectId: number | null = null
  if (projectFilterSlug && projectFilterSlug !== "all") {
    const hitProject = projects.find(p => p.slug === projectFilterSlug)
    if (hitProject) hitProjectId = hitProject.id
  }

  const materials: MaterialRow[] = await fetchMaterials(userId, hitProjectId)
  const materialIds = materials.map(m => m.id)
  if (materialIds.length === 0) {
    return {
      projects,
      items: [],
      filterProjectSlug: projectFilterSlug ?? "all",
      hitProjectId,
      materialsCount: 0,
    }
  }

  const plans: PlanRow[] = await fetchPlans(userId, materialIds)

  const latestPlanByMaterial = new Map<number, PlanRow | undefined>()
  {
    const grouped = new Map<number, PlanRow[]>()
    for (const p of plans) {
      const arr = grouped.get(p.material_id) ?? []
      arr.push(p)
      grouped.set(p.material_id, arr)
    }
    for (const id of materialIds) {
      const planList = grouped.get(id) ?? []
      const activePlan = planList.find(x => x.is_active === true)
      latestPlanByMaterial.set(id, activePlan ?? planList[0])
    }
  }

  const items = materials.map((m) => {
    const p = latestPlanByMaterial.get(m.id)
    const proj = projects.find(x => x.id === m.project_id)
    return {
      id: m.id,
      title: m.title,
      start: p?.start_date ?? "",
      end: p?.end_date ?? "",
      projectSlug: proj?.slug ?? "",
      projectName: proj?.name ?? "",
    }
  })

  return {
    projects,
    items,
    filterProjectSlug: projectFilterSlug ?? "all",
    hitProjectId,
    materialsCount: materials.length,
  }
})

export const preloadDashboardData = (userId: string, projectFilterSlug?: string) => {
  void getDashboardData(userId, projectFilterSlug)
}
