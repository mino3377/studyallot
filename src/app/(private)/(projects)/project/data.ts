//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\data.ts
import { cache } from "react"
import {
  getAllProjectsVM,
  type PlanRow,
  type SectionRow,
} from "./queries"
import {
  parseISO,
  computePlannedCellsUntilToday,
} from "@/lib/progress-alloc"

export type ProjectView = {
  id: string
  slug: string
  name: string
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  plannedPct: number
  actualPct: number
  inProgressMaterials: number
  totalCells: number
  plannedCellsUntilToday: number
  actualCellsUntilToday: number
}

export type ProjectPageData = {
  projects: ProjectView[]
  summary: {
    totalProjects: number
    inProgressProjects: number
    avgPlannedPct: number
    avgActualPct: number
    materialsTotalAll: number
    inProgressMaterialsAll: number
    plannedCellsUntilTodayAll: number
    actualCellsUntilTodayAll: number
    todayRatePctAll: number
  }
}

function buildChosenPlanByMaterial(plans: PlanRow[], materialIds: number[]) {
  const chosen = new Map<number, PlanRow | undefined>()
  for (const mId of materialIds) {
    const list = plans.filter(p => p.material_id === mId)
    const activePlan = list.find(p => p.is_active)
    chosen.set(mId, activePlan ?? list[0])
  }
  return chosen
}

function buildSectionsMaps(sections: SectionRow[]) {
  const sectionsByMaterial = new Map<number, SectionRow[]>()
  const sectionToMaterial = new Map<number, number>()
  for (const s of sections) {
    const arr = sectionsByMaterial.get(s.material_id) ?? []
    arr.push(s)
    sectionsByMaterial.set(s.material_id, arr)
    sectionToMaterial.set(s.id, s.material_id)
  }
  return { sectionsByMaterial, sectionToMaterial }
}

export const getProjectData = cache(async (userId: string, todayISO: string): Promise<ProjectPageData> => {
  const { projectsRaw, materials, plans, sections, records } =
    await getAllProjectsVM(userId)

  if (projectsRaw.length === 0) {
    return {
      projects: [],
      summary: {
        totalProjects: 0,
        inProgressProjects: 0,
        avgPlannedPct: 0,
        avgActualPct: 0,
        materialsTotalAll: 0,
        inProgressMaterialsAll: 0,
        plannedCellsUntilTodayAll: 0,
        actualCellsUntilTodayAll: 0,
        todayRatePctAll: 0,
      },
    }
  }

  const materialIds = materials.map(m => m.id)
  const chosenPlanByMaterial = buildChosenPlanByMaterial(plans, materialIds)
  const { sectionsByMaterial, sectionToMaterial } = buildSectionsMaps(sections)

  const materialToProject = new Map<number, number>()
  for (const m of materials) materialToProject.set(m.id, m.project_id)

  const projectDateSets = new Map<number, Set<string>>()
  for (const p of projectsRaw) projectDateSets.set(p.id, new Set<string>())

  const recordDateByKey = new Map<string, string>()
for (const r of records) {
  const iso = String(r.recorded_on).slice(0, 10)
  recordDateByKey.set(`${r.section_id}:${r.rap_no}`, iso)

  const matId = sectionToMaterial.get(r.section_id)
  if (matId) {
    const projId = materialToProject.get(matId)
    if (projId) {
      projectDateSets.get(projId)!.add(iso)
    }
  }
}

  type Acc = {
    materialsTotal: number
    inProgressMaterials: number
    totalCells: number
    minStart?: string
    maxEnd?: string
    plannedCellsUntilToday: number
    actualCellsUntilToday: number
  }

  const accByProject = new Map<number, Acc>()
  for (const p of projectsRaw) {
    accByProject.set(p.id, {
      materialsTotal: 0,
      inProgressMaterials: 0,
      totalCells: 0,
      minStart: undefined,
      maxEnd: undefined,
      plannedCellsUntilToday: 0,
      actualCellsUntilToday: 0,
    })
  }

  for (const m of materials) {
    const acc = accByProject.get(m.project_id)!
    acc.materialsTotal += 1

    const plan = chosenPlanByMaterial.get(m.id)
    const rounds = Math.max(1, plan?.rounds ?? 1)
    const sectionsOfMat = sectionsByMaterial.get(m.id) ?? []
    const sectionCount =
      sectionsOfMat.length > 0 ? sectionsOfMat.length : Math.max(0, plan?.total_units ?? 0)
    const totalCells = sectionCount * rounds
    acc.totalCells += totalCells

    let completed = 0
    let completedUntilToday = 0

    if (sectionsOfMat.length > 0) {
      for (const s of sectionsOfMat) {
        for (let r = 1; r <= rounds; r++) {
          const key = `${s.id}:${r}`
          const date = recordDateByKey.get(key)
          if (date) {
            completed += 1
            completedUntilToday += 1
          }
        }
      }
    }

    const actualPctForInProgress =
      totalCells > 0 ? Math.round((completed / totalCells) * 100) : 0

    const { plannedCells } =
      totalCells > 0
        ? computePlannedCellsUntilToday(totalCells, plan?.start_date, plan?.end_date, todayISO)
        : { plannedCells: 0 }

    if (totalCells > 0) {
      if (actualPctForInProgress > 0 && actualPctForInProgress < 100) {
        acc.inProgressMaterials += 1
      }
    }

    acc.plannedCellsUntilToday += plannedCells
    acc.actualCellsUntilToday += completedUntilToday

    if (plan?.start_date) {
      acc.minStart = !acc.minStart || plan.start_date < acc.minStart ? plan.start_date : acc.minStart
    }
    if (plan?.end_date) {
      acc.maxEnd = !acc.maxEnd || plan.end_date > acc.maxEnd ? plan.end_date : acc.maxEnd
    }
  }

  const projects = projectsRaw.map<ProjectView>(p => {
    const a = accByProject.get(p.id)!
    const plannedPct =
      a.totalCells > 0 ? Math.floor((a.plannedCellsUntilToday / a.totalCells) * 100) : 0

    const actualPct =
      a.totalCells > 0 ? Math.floor((a.actualCellsUntilToday / a.totalCells) * 100) : 0

    let daysLeftLabel = "—"
    if (a.maxEnd) {
      const end = parseISO(a.maxEnd)!
      const diff = Math.ceil((end.getTime() - parseISO(todayISO)!.getTime()) / 86400000)
      daysLeftLabel = diff >= 0 ? `残り ${diff}日` : `終了 ${-diff}日経過`
    }

    return {
      id: String(p.id),
      slug: p.slug,
      name: p.name,
      period: {
        from: a.minStart ? a.minStart.replaceAll("-", "/") : "—",
        to: a.maxEnd ? a.maxEnd.replaceAll("-", "/") : "—",
      },
      daysLeftLabel,
      materialsTotal: a.materialsTotal,
      plannedPct,
      actualPct,
      inProgressMaterials: a.inProgressMaterials,
      totalCells: a.totalCells,
      plannedCellsUntilToday: a.plannedCellsUntilToday,
      actualCellsUntilToday: a.actualCellsUntilToday,
    }
  })

  const totalProjects = projects.length
  const inProgressProjects = projects.filter(p => p.actualPct > 0 && p.actualPct < 100).length

  const totalCellsAll = projects.reduce((s, p) => s + p.totalCells, 0)
  const materialsTotalAll = projects.reduce((s, p) => s + p.materialsTotal, 0)
  const inProgressMaterialsAll = projects.reduce((s, p) => s + p.inProgressMaterials, 0)
  const plannedCellsUntilTodayAll = projects.reduce((s, p) => s + p.plannedCellsUntilToday, 0)
  const actualCellsUntilTodayAll = projects.reduce((s, p) => s + p.actualCellsUntilToday, 0)

  const avgPlannedPct =
    totalCellsAll === 0 ? 0 : Math.floor((plannedCellsUntilTodayAll / totalCellsAll) * 100)

  const avgActualPct =
    totalCellsAll === 0 ? 0 : Math.floor((actualCellsUntilTodayAll / totalCellsAll) * 100)

  const todayRatePctAll =
    plannedCellsUntilTodayAll === 0
      ? 0
      : Math.floor((actualCellsUntilTodayAll / plannedCellsUntilTodayAll) * 100)

  return {
    projects,
    summary: {
      totalProjects,
      inProgressProjects,
      avgPlannedPct,
      avgActualPct,
      materialsTotalAll,
      inProgressMaterialsAll,
      plannedCellsUntilTodayAll,
      actualCellsUntilTodayAll,
      todayRatePctAll,
    },
  }
})

export function preloadProjectData(userId: string, todayISO: string) {
  void getProjectData(userId, todayISO)
}