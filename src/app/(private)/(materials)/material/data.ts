//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\material\data.ts

import "server-only"
import { cache } from "react"
import {
  getAllMaterialsRaw,
  type MaterialRow,
  type PlanRow,
  type SectionRow,
  type RecordRow,
} from "./queries"
import { computePlannedCellsUntilToday } from "@/lib/progress-alloc"

export type MaterialsVM = {
  materialsVM: Array<{
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
  }>
  summary: {
    globalMinStart: string | undefined
    globalMaxEnd: string | undefined
    totalMaterials: number
    activeMaterials: number
    avgPlannedPct: number
    avgActualPct: number
    todayRatePct: number
    plannedCellsUntilToday: number
    actualCellsUntilToday: number
  }
}

function fmtDateYYYYMMDDSlash(d?: string | null) {
  if (!d) return "—"
  return d.slice(0, 10).replaceAll("-", "/")
}

export const getMaterialsData = cache(async (userId: string, todayISO: string) => {
  const { materials, plans, sections, records } = await getAllMaterialsRaw(userId)

  type PlanLite = Pick<PlanRow, "material_id" | "total_units" | "rounds" | "start_date" | "end_date" | "is_active">
  const latestPlanByMaterial = new Map<
    number,
    { total_units: number | null; rounds: number | null; start_date: string | null; end_date: string | null } | undefined
  >()
  const groups = new Map<number, PlanLite[]>()
  for (const p of plans as PlanLite[]) {
    const arr = groups.get(p.material_id) ?? []
    arr.push(p)
    groups.set(p.material_id, arr)
  }
  for (const mId of materials.map(m => m.id)) {
    const pArray = groups.get(mId) ?? []
    const activePlan = pArray.find((p) => p.is_active === true)
    latestPlanByMaterial.set(mId, activePlan ?? pArray[0])
  }

  const sectionByMaterial = new Map<number, { id: number; order_key: number | null }[]>()
  for (const s of sections as SectionRow[]) {
    const sArray = sectionByMaterial.get(s.material_id) ?? []
    sArray.push(s)
    sectionByMaterial.set(s.material_id, sArray)
  }

  const recordDateByKey = new Map<string, string>()
  for (const r of records as RecordRow[]) {
    recordDateByKey.set(`${r.section_id}:${r.rap_no}`, r.recorded_on)
  }

  let globalMinStart: string | undefined
  let globalMaxEnd: string | undefined

  let plannedCellsUntilToday = 0
  let actualCellsUntilToday = 0

  let totalCellsAll = 0
  let completedCellsAll = 0

  const materialsVM = (materials as MaterialRow[]).map((m) => {
    const p = latestPlanByMaterial.get(m.id) ?? undefined
    const rounds = Math.max(1, Number(p?.rounds ?? 1))
    const sectionsOfMat = sectionByMaterial.get(m.id) ?? []
    const sectionCount =
      sectionsOfMat.length > 0 ? sectionsOfMat.length : Math.max(0, Number(p?.total_units ?? 0))
    const totalCells = sectionCount * rounds

    let completedTotal = 0
    let completedUntilToday = 0
    for (const s of sectionsOfMat) {
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
        ? computePlannedCellsUntilToday(
            totalCells,
            p?.start_date ?? null,
            p?.end_date ?? null,
            todayISO
          )
        : { plannedCells: 0, plannedPct: 0 }

    const actualPct = totalCells > 0 ? Math.floor((completedTotal / totalCells) * 100) : 0

    plannedCellsUntilToday += plannedCells
    actualCellsUntilToday += completedUntilToday

    if (totalCells > 0) {
      totalCellsAll += totalCells
      completedCellsAll += completedTotal
    }

    if (p?.start_date) {
      globalMinStart =
        !globalMinStart || p.start_date < globalMinStart ? p.start_date : globalMinStart
    }
    if (p?.end_date) {
      globalMaxEnd =
        !globalMaxEnd || p.end_date > globalMaxEnd ? p.end_date : globalMaxEnd
    }

    return {
      id: m.id,
      slug: m.slug,
      title: m.title,
      startDate: fmtDateYYYYMMDDSlash(p?.start_date),
      endDate: fmtDateYYYYMMDDSlash(p?.end_date),
      totalUnits: sectionCount,
      lapsNow: 0,
      lapsTotal: rounds,
      plannedPct,
      actualPct,
    }
  })

  const avgPlannedPct =
    totalCellsAll === 0 ? 0 : Math.floor((plannedCellsUntilToday / totalCellsAll) * 100)

  const avgActualPct =
    totalCellsAll === 0 ? 0 : Math.floor((completedCellsAll / totalCellsAll) * 100)

  const todayRatePct =
    plannedCellsUntilToday === 0
      ? 0
      : Math.floor((actualCellsUntilToday / plannedCellsUntilToday) * 100)

  const activeMaterials = materialsVM.filter(
    (m) => m.actualPct > 0 && m.actualPct < 100
  ).length

  return {
    materialsVM,
    summary: {
      globalMinStart,
      globalMaxEnd,
      totalMaterials: materialsVM.length,
      activeMaterials,
      avgPlannedPct,
      avgActualPct,
      todayRatePct,
      plannedCellsUntilToday,
      actualCellsUntilToday,
    },
  }
})

export const preloadMaterialsData = (userId: string, todayISO: string) => {
  void getMaterialsData(userId, todayISO)
}