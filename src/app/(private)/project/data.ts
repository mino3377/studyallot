// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\data.ts
import {
  fetchMaterialsByProjectIds,
  fetchProjects,
  type MaterialRow,
  type ProjectRow,
} from "./queries"
import type { MaterialVM, UnitType } from "@/lib/type/material"

export type ProjectForCarousel = {
  id: number | string
  slug: string
  name: string
  order: number
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  actualPct: number
  plannedPct: number
}

function safeISO(s?: string | null) {
  return (s ?? "").slice(0, 10)
}

function sumDays(days: number[] | null | undefined) {
  if (!days || days.length === 0) return 0
  let s = 0
  for (const n of days) s += Number.isFinite(n) ? n : 0
  return s
}

function clampPct100(n: number) {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return n
}

// ★DBの unit_type を「実行時に」安全に UnitType へ正規化
function normalizeUnitType(v: unknown): UnitType {
  const s = String(v ?? "").trim().toLowerCase()
  if (s === "chapter") return "chapter"
  if (s === "unit") return "unit"
  if (s === "page") return "page"
  return "section"
}

// ★unitType からラベルを確定（DBに unit_label が無い前提）
function unitTypeToLabel(unitType: UnitType) {
  switch (unitType) {
    case "chapter":
      return "チャプター"
    case "unit":
      return "ユニット"
    case "page":
      return "ページ"
    case "section":
    default:
      return "セクション"
  }
}

function materialToVM(m: MaterialRow): MaterialVM {
  const startDate = safeISO(m.start_date) || ""
  const endDate = safeISO(m.end_date) || ""

  const totalUnits = Number(m.unit_count ?? 0)
  const lapsTotal = Number(m.rounds ?? 0)
  const totalTasks = Math.max(0, totalUnits * lapsTotal)

  const plannedTotal = sumDays(m.plan_days)
  const actualTotal = sumDays(m.actual_days)

  const denom = plannedTotal > 0 ? plannedTotal : Math.max(1, totalTasks)
  const plannedPct = clampPct100((plannedTotal / denom) * 100)
  const actualPct = clampPct100((actualTotal / denom) * 100)

  const lapsNow = totalUnits > 0 ? Math.floor(actualTotal / totalUnits) : 0

  // ★ここが本体：unit_type を確実に正規化して、unitLabel も教材ごとに確定
  const unitType = normalizeUnitType(m.unit_type)
  const unitLabel = unitTypeToLabel(unitType)

  return {
    id: m.id,
    title: m.title,
    slug: m.slug,
    order: Number.isFinite(m.order as any) ? Number(m.order) : 999999, // ★NULLは末尾
    startDate,
    endDate,
    totalUnits,
    lapsNow,
    lapsTotal,
    plannedPct,
    actualPct,
    planDays: m.plan_days ?? [],
    actualDays: m.actual_days ?? [],
    unitType,
    unitLabel,
  }
}

function groupMaterialsByProjectSlug(
  projects: ProjectRow[],
  materials: MaterialRow[]
): Record<string, MaterialVM[]> {
  const projectIdToSlug: Record<number, string> = {}
  for (const p of projects) projectIdToSlug[p.id] = p.slug

  const out: Record<string, MaterialVM[]> = {}
  for (const p of projects) out[p.slug] = []

  for (const m of materials) {
    const pSlug = projectIdToSlug[m.project_id]
    if (!pSlug) continue
    out[pSlug].push(materialToVM(m))
  }

  for (const slug of Object.keys(out)) {
    out[slug].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return String(a.id).localeCompare(String(b.id))
    })
  }

  return out
}

export async function getProjectPageData(userId: string): Promise<{
  projects: ProjectForCarousel[]
  materialsBySlug: Record<string, MaterialVM[]>
}> {
  const projectsRaw = await fetchProjects(userId)
  const projectIds = projectsRaw.map((p) => p.id)

  const matsRaw = await fetchMaterialsByProjectIds(userId, projectIds)

  const materialsBySlug = groupMaterialsByProjectSlug(projectsRaw, matsRaw)

  const projects: ProjectForCarousel[] = projectsRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    order: Number((p as any).order ?? 0),
    period: { from: "", to: "" },
    daysLeftLabel: "",
    materialsTotal: (materialsBySlug[p.slug] ?? []).length,
    plannedPct: 0,
    actualPct: 0,
  }))

  return { projects, materialsBySlug }
}

export function preloadProjectPageData(userId: string) {
  void getProjectPageData(userId)
}