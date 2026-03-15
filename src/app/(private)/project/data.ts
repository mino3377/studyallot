// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\data.ts
import {ProjectDetails, ProjectRow } from "@/lib/type/project_type"
import {
  fetchMaterialsByProjectIds,
  fetchProjects,
} from "./queries"
import type { MaterialRow, MaterialVM } from "@/lib/type/material_type"

//〇〇〇〇-〇〇-〇〇（年月日）
function safeISO(s?: string | null) {
  return (s ?? "").slice(0, 10)
}

function sumDays(days: number[] | null | undefined) {
  if (!days || days.length === 0) return 0
  let s = 0
  for (const tasknum of days) s += isFinite(tasknum) ? tasknum : 0
  if (s === 0 || s < 0) return 1
  return s
}

function clampPct100(n: number) {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return n
}


function materialToVM(m: MaterialRow): MaterialVM {
  const start_date = safeISO(m.start_date)
  const end_date = safeISO(m.end_date)

  const unit_count = m.unit_count
  const rounds = m.rounds
  const totalTasks = Math.max(0, unit_count * rounds)

  const plannedTotal = sumDays(m.plan_days)
  const actualTotal = sumDays(m.actual_days)

  const denominator = plannedTotal > 0 ? plannedTotal : Math.max(1, totalTasks)
  const plannedPct = clampPct100((plannedTotal / denominator) * 100)
  const actualPct = clampPct100((actualTotal / denominator) * 100)

  const rounds_now = unit_count > 0 ? Math.floor(actualTotal / unit_count) : 0

  const unit_type = m.unit_type

  return {
    id: m.id,
    title: m.title,
    project_id: m.project_id,
    slug: m.slug,
    order: m.order,
    start_date,
    end_date,
    unit_count,
    rounds_now,
    rounds,
    plannedPct,
    actualPct,
    plan_days: m.plan_days ?? [],
    actual_days: m.actual_days ?? [],
    unit_type,
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

  //教材配列をorder順に（nullあればorderの整形）
  for (const slug of Object.keys(out)) {

    out[slug].sort((a, b) => {
      return a.order - b.order
    })
    out[slug].forEach((m, index) => {
      m.order = index
    })
  }

  return out
}

export async function getProjectPageData(userId: string): Promise<{
  projects: ProjectDetails[]
  materialsByProjectSlug: Record<string, MaterialVM[]>
}> {
  const projectsRaw = await fetchProjects(userId)
  const projectIds = projectsRaw.map((p) => p.id)

  //すべての教材配列
  const materialsRaw = await fetchMaterialsByProjectIds(userId, projectIds)

  //プロジェクトスラッグと教材配列の一対一
  const materialsByProjectSlug = groupMaterialsByProjectSlug(projectsRaw, materialsRaw)

  const projects= projectsRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    order: p.order,
    period: { from: "", to: "" },
    daysLeftLabel: "",
    materialsTotal: materialsByProjectSlug[p.slug].length,
    plannedPct: 0,
    actualPct: 0,
  }))

  return { projects, materialsByProjectSlug }
}

export function preloadProjectPageData(userId: string) {
  void getProjectPageData(userId)
}