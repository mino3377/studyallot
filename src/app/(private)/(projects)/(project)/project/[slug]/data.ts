// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\data.ts
import { cache } from "react"
import {
  getProjectDetailVM,
  type MaterialRow,
  type PlanRow,
  type SectionRow,
} from "./queries"
import { computePlannedCellsUntilToday } from "@/lib/progress-alloc"

function fmtDateYYYYMMDDSlash(d?: string | null) {
  if (!d) return ""
  return d.slice(0, 10).replaceAll("-", "/")
}

function makeDaysLeftLabel(projectMaxEndISO: string | undefined, todayISO: string): string {
  if (!projectMaxEndISO) return "—"
  const end = new Date(projectMaxEndISO + "T00:00:00")
  const today = new Date(todayISO + "T00:00:00")

  const ms = end.getTime() - today.getTime()
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))

  if (days > 1) return `残り ${days} 日`
  if (days === 1) return "残り 1 日"
  if (days === 0) return "今日で終了"
  return "終了"
}


export type MaterialVM = {
  id: number | string
  slug: string
  title: string
  startDate: string
  endDate: string
  totalUnits: number
  lapsNow: number
  lapsTotal: number
  plannedPct: number
  actualPct: number
}

export type ProjectHeaderVM = {
  projectId: number
  slug: string
  name: string
  period: { from: string; to: string }
  goalLabel: string
  daysLeftLabel: string
  materialsTotal: number
}

export type ProjectStatsVM = {
  totalMaterials: number
  activeMaterials: number
  avgPlannedPct: number
  avgActualPct: number
  projectPlannedCellsUntilToday: number
  projectActualCellsUntilToday: number
  todayRatePct: number
}

export type ProjectPageData = {
  header: ProjectHeaderVM
  materialsVM: MaterialVM[]
  stats: ProjectStatsVM
}

export const loadProjectPageData = cache(
  async (userId: string, slug: string, todayISO: string): Promise<ProjectPageData | null> => {
    const bundle = await getProjectDetailVM(slug, userId)
    if (!bundle) return null

    const { project: proj, materials, plans, sections, records } = bundle
    const materialIds = materials.map((m) => m.id)

    const groups = new Map<number, PlanRow[]>()
    for (const p of plans) {
      const arr = groups.get(p.material_id) ?? []
      arr.push(p)
      groups.set(p.material_id, arr)
    }

    const latestPlanByMaterial = new Map<
      number,
      { total_units: number | null; rounds: number | null; start_date: string | null; end_date: string | null } | undefined
    >()
    for (const mId of materialIds) {
      const list = groups.get(mId) ?? []
      const active = list.find((x) => x?.is_active === true)
      latestPlanByMaterial.set(mId, active ?? list[0])
    }

    const sectionByMaterial = new Map<number, SectionRow[]>()
    for (const s of sections) {
      const arr = sectionByMaterial.get(s.material_id) ?? []
      arr.push(s)
      sectionByMaterial.set(s.material_id, arr)
    }

    const recordDateByKey = new Map<string, string>() // `${section_id}:${rap_no}` -> 'YYYY-MM-DD'
    for (const r of records) {
      recordDateByKey.set(`${r.section_id}:${r.rap_no}`, r.recorded_on)
    }

    let projectMinStart: string | undefined
    let projectMaxEnd: string | undefined

    let projectTotalCells = 0
    let projectCompletedCellsTotal = 0

    let projectPlannedCellsUntilToday = 0
    let projectActualCellsUntilToday = 0

    const materialsVM: MaterialVM[] = (materials as MaterialRow[]).map((m) => {
      const p = latestPlanByMaterial.get(m.id) ?? undefined
      const rounds = Math.max(1, Number(p?.rounds ?? 1))
      const secs = sectionByMaterial.get(m.id) ?? []
      const sectionCount = secs.length > 0 ? secs.length : Math.max(0, Number(p?.total_units ?? 0))
      const totalCells = sectionCount * rounds

      let completedTotal = 0
      let completedUntilToday = 0
      for (const s of secs) {
        for (let r = 1; r <= rounds; r++) {
          const key = `${s.id}:${r}`
          const rec = recordDateByKey.get(key)
          if (rec) {
            completedTotal += 1
            completedUntilToday += 1
          }
        }
      }

      const { plannedCells, plannedPct } =
        totalCells > 0
          ? computePlannedCellsUntilToday(totalCells, p?.start_date ?? null, p?.end_date ?? null, todayISO)
          : { plannedCells: 0, plannedPct: 0 }

      const actualPct = totalCells > 0 ? Math.floor((completedTotal / totalCells) * 100) : 0

      if (totalCells > 0) {
        projectTotalCells += totalCells
        projectCompletedCellsTotal += completedTotal
      }

      projectPlannedCellsUntilToday += plannedCells
      projectActualCellsUntilToday += completedUntilToday

      if (p?.start_date) {
        projectMinStart = !projectMinStart || p.start_date < projectMinStart ? p.start_date : projectMinStart
      }
      if (p?.end_date) {
        projectMaxEnd = !projectMaxEnd || p.end_date > projectMaxEnd ? p.end_date : projectMaxEnd
      }

      return {
        id: m.id,
        title: m.title,
        slug: m.slug,
        startDate: fmtDateYYYYMMDDSlash(p?.start_date),
        endDate: fmtDateYYYYMMDDSlash(p?.end_date),
        totalUnits: sectionCount,
        lapsNow: 0,
        lapsTotal: rounds,
        plannedPct,
        actualPct,
      }
    })

    const totalMaterials = materialsVM.length
    const activeMaterials = materialsVM.filter((m) => m.actualPct > 0 && m.actualPct < 100).length
    
    const avgPlannedPct =
      projectTotalCells === 0 ? 0 : Math.floor((projectPlannedCellsUntilToday / projectTotalCells) * 100)

    const avgActualPct =
      projectTotalCells === 0 ? 0 : Math.floor((projectCompletedCellsTotal / projectTotalCells) * 100)

    const todayRatePct =
      projectPlannedCellsUntilToday === 0
        ? 0
        : Math.floor((projectActualCellsUntilToday / projectPlannedCellsUntilToday) * 100)

    const header = {
      projectId: proj.id,
      slug: proj.slug,
      name: proj.name,
      period: {
        from: projectMinStart ? fmtDateYYYYMMDDSlash(projectMinStart) : "—",
        to: projectMaxEnd ? fmtDateYYYYMMDDSlash(projectMaxEnd) : "—",
      },
      goalLabel: (proj.goal as string) ?? "",
      daysLeftLabel: makeDaysLeftLabel(projectMaxEnd, todayISO),
      materialsTotal: totalMaterials,
    }

    const stats = {
      totalMaterials,
      activeMaterials,
      avgPlannedPct,
      avgActualPct,
      projectPlannedCellsUntilToday,
      projectActualCellsUntilToday,
      todayRatePct,
    }

    return { header, materialsVM, stats }
  }
)

export const preloadProjectData = (userId: string, slug: string, todayISO: string) => {
  void loadProjectPageData(userId, slug, todayISO)
}
