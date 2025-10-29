// C:\Users\chiso\nextjs\study-allot\src\app\(private)\dashboard\page.tsx

import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { ProjectSelectButton } from "@/components/project-select-button"

import { createClient } from "@/utils/supabase/server"
import { GanttItem } from "@/lib/type/dashboard"
import ManualGantt from "./_components/ManualGantt"

type SourceType = "book" | "video" | "paper" | "web" | "other"

type ProjectLite = { id: number; name: string; slug: string }
type MaterialRow = { id: number; title: string; source_type: SourceType; project_id: number; user_id: string }
type PlanRow = {
  material_id: number; total_units: number | null; rounds: number | null;
  start_date: string | null; end_date: string | null; is_active: boolean | null; created_at: string | null; user_id: string
}

export default async function DashboardPage({ searchParams }: { searchParams: { project?: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  // プロジェクト（セレクタ用）
  const { data: projRows } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
  const projects: ProjectLite[] = (projRows ?? [])

  //特定のプロジェクトが選択された場合
  const projectFilterSlug = searchParams.project && searchParams.project !== "all"
    ? searchParams.project
    : undefined

  // 教材（プロジェクト絞込）
  let mQuery = supabase
    .from("materials")
    .select("id, title, source_type, project_id, user_id")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  let projectIdFilter: number | null = null
  //特定のプロジェクトが選択された場合
  if (projectFilterSlug) {
    const hit = projects.find(p => p.slug === projectFilterSlug)
    //特定のプロジェクトがさっきとってきたプロジェクト配列に存在すれば
    if (hit) {
      projectIdFilter = hit.id
      mQuery = mQuery.eq("project_id", hit.id)
    }
  }

  const { data: mats } = await mQuery
  const materials = (mats ?? []) as MaterialRow[]
  const materialIds = materials.map(m => m.id)

  if (materialIds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <ProjectSelectButton projects={projects} />
        </div>
        <Card className="w-full overflow-hidden p-8 text-sm text-muted-foreground">
          {projectIdFilter ? "プロジェクトのマテリアルがありません" : "プロジェクトが見つかりません"}
        </Card>
      </div>
    )
  }

  // プラン（is_active 優先 → 最新）
  const { data: planRows } = await supabase
    .from("plans")
    .select("material_id, total_units, rounds, start_date, end_date, is_active, created_at, user_id")
    .in("material_id", materialIds)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
  const plans = (planRows ?? []) as PlanRow[]

  const latestPlanByMaterial = new Map<number, PlanRow | undefined>()
  {
    const grouped = new Map<number, PlanRow[]>()
    for (const p of plans) {
      const arr = grouped.get(p.material_id) ?? []
      arr.push(p)
      grouped.set(p.material_id, arr)
    }
    for (const id of materialIds) {
      const list = grouped.get(id) ?? []
      const active = list.find(x => x.is_active === true)
      latestPlanByMaterial.set(id, active ?? list[0])
    }
  }

  // Ganttアイテム（有効な期間を持つもののみ）
  const items: GanttItem[] = materials.map((m) => {
    const p = latestPlanByMaterial.get(m.id)
    return {
      id: m.id,
      title: m.title,
      start: p?.start_date ?? "",
      end: p?.end_date ?? "",
      projectSlug: projects.find(x => x.id === m.project_id)?.slug ?? "",
      projectName: projects.find(x => x.id === m.project_id)?.name ?? "",
    }
  }).filter(x => x.start && x.end)

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <ProjectSelectButton projects={projects} />
        </div>
        <Card className="w-full overflow-hidden p-8 text-sm text-muted-foreground">
          計画（開始/終了日）が設定されている教材がありません。
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ProjectSelectButton projects={projects} />
      </div>

      <Card className="w-full overflow-hidden p-2">
        <ManualGantt
          items={items}
          filterProjectSlug={searchParams.project ?? "all"}
          defaultMode="year"
        />
      </Card>
    </div>
  )
}
