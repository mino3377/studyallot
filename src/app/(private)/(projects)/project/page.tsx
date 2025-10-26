import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  BarChart3,
  Target,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Layers,
} from "lucide-react"
import AddButton from "@/components/add-button"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

// ★ 共通ユーティリティを分離
import {
  toLocalISODate,
  parseISO,
  buildDailyAllocation,
  computePlannedCellsUntilToday,
  computeStreak,
} from "@/lib/progress-alloc"
import ProgressRateCard from "@/components/progress-rate-card"
import CompletionTillTodayCard from "@/components/conpletion-till-today-card"
import MaterialsNumCard from "@/components/materials-num-card"

// ---- 型 ---------------------------------------------------------------------
type ProjectRow = { id: number; slug: string; name: string; category: string; created_at: string }
type MaterialRow = { id: number; project_id: number; title: string }
type PlanRow = {
  material_id: number; total_units: number | null; rounds: number | null;
  start_date: string | null; end_date: string | null; is_active: boolean | null; created_at: string
}
type SectionRow = { id: number; material_id: number; order_key: number | null }
type RecordRow = { section_id: number; rap_no: number; recorded_on: string }

type ProjectView = {
  id: string
  slug: string
  name: string
  category: string
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  plannedPct: number // 計画平均
  actualPct: number  // 実績平均
  inProgressMaterials: number
  totalCells: number
  // ★ 追加：今日まで集計
  plannedCellsUntilToday: number
  actualCellsUntilToday: number
  // ★ 追加：連続日数（プロジェクト内のどれか1教材でも完了があればカウント）
  streakDays: number
}

export default async function ProjectPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  // 1) プロジェクト一覧
  const { data: projRows } = await supabase
    .from("projects")
    .select("id, slug, name, category, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  const projectsRaw: ProjectRow[] = projRows ?? []
  const projectIds = projectsRaw.map(p => p.id)
  const todayISO = toLocalISODate(new Date())

  // 空
  if (projectIds.length === 0) {
    return (
      <div className="space-y-6">
        {/* サマリー（空） */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">プロジェクト数</div>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              進行中 0 件
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items中心 justify-between">
              <div className="text-sm text-muted-foreground">進捗率（平均）</div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">0%</div>
            <div className="mt-3 space-y-2">
              {/* 上：計画（黒） */}
              <div className="flex items-center gap-2">
                <div className="w-full relative">
                  <div className="h-2 bg-muted rounded" />
                  <div className="absolute left-0 top-0 h-2 bg-black rounded" style={{ width: `0%` }} />
                </div>
                <span className="text-xs w-12 text-right">0%</span>
              </div>
              {/* 下：実績（色） */}
              <div className="flex items-center gap-2">
                <Progress value={0} className="h-2 w-full [&>div]:bg-yellow-500" />
                <span className="text-xs w-12 text-right text-yellow-600">0%</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">教材数（合計）</div>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
            {/* ★ 追記：進行中件数 */}
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              進行中 0 件
            </div>
          </Card>
        </div>

        <AddButton href={"/add-project"} text={"プロジェクトを追加"} title={"プロジェクト一覧"} />
      </div>
    )
  }

  // 2) 各プロジェクトの教材
  const { data: matRows } = await supabase
    .from("materials")
    .select("id, project_id, title")
    .in("project_id", projectIds)
    .eq("user_id", auth.user.id)

  const materials: MaterialRow[] = matRows ?? []
  const materialIds = materials.map(m => m.id)

  // 3) プラン（is_active 優先→なければ最新）
  let chosenPlanByMaterial = new Map<number, PlanRow | undefined>()
  if (materialIds.length > 0) {
    const { data: planRows } = await supabase
      .from("plans")
      .select("material_id, total_units, rounds, start_date, end_date, is_active, created_at")
      .in("material_id", materialIds)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })

    const plans = planRows ?? []
    for (const mId of materialIds) {
      const list = plans.filter(p => p.material_id === mId)
      const active = list.find(p => p.is_active)
      chosenPlanByMaterial.set(mId, active ?? list[0])
    }
  }

  // 4) セクション（各教材）
  let sectionsByMaterial = new Map<number, SectionRow[]>()
  const sectionToMaterial = new Map<number, number>()
  if (materialIds.length > 0) {
    const { data: secRows } = await supabase
      .from("sections")
      .select("id, material_id, order_key")
      .in("material_id", materialIds)
      .eq("user_id", auth.user.id)
      .order("order_key", { ascending: true })

    for (const s of (secRows ?? [])) {
      const arr = sectionsByMaterial.get(s.material_id) ?? []
      arr.push(s)
      sectionsByMaterial.set(s.material_id, arr)
      sectionToMaterial.set(s.id, s.material_id)
    }
  }

  // 材料→プロジェクト map
  const materialToProject = new Map<number, number>()
  for (const m of materials) materialToProject.set(m.id, m.project_id)

  // 5) 実績（section_records）…最新1行のみの想定（キー重複は無い運用）
  const allSectionIds = Array.from(sectionsByMaterial.values()).flat().map(s => s.id)
  // ★ プロジェクト別の「完了がある日」集合（streak用）
  const projectDateSets = new Map<number, Set<string>>()
  for (const p of projectsRaw) projectDateSets.set(p.id, new Set<string>())

  // ★ セクション×周回 → recorded_on（今日まで判定・完了数用）
  const recordDateByKey = new Map<string, string>() // `${section_id}:${rap_no}` -> 'YYYY-MM-DD'

  if (allSectionIds.length > 0) {
    const { data: recs } = await supabase
      .from("section_records")
      .select("section_id, rap_no, recorded_on")
      .eq("user_id", auth.user.id)
      .in("section_id", allSectionIds)

    for (const r of (recs ?? [] as RecordRow[])) {
      recordDateByKey.set(`${r.section_id}:${r.rap_no}`, r.recorded_on)

      const matId = sectionToMaterial.get(r.section_id)
      if (matId) {
        const projId = materialToProject.get(matId)
        if (projId) {
          projectDateSets.get(projId)!.add(r.recorded_on)
        }
      }
    }
  }

  // 6) 材料→進捗％/セル数を計算、プロジェクトに集約
  type Acc = {
    materialsTotal: number
    plannedSum: number
    actualSum: number
    denom: number
    inProgressMaterials: number
    totalCells: number
    minStart?: string
    maxEnd?: string
    // 今日まで
    plannedCellsUntilToday: number
    actualCellsUntilToday: number
  }
  const accByProject = new Map<number, Acc>()
  for (const p of projectsRaw) {
    accByProject.set(p.id, {
      materialsTotal: 0,
      plannedSum: 0,
      actualSum: 0,
      denom: 0,
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
    const sections = sectionsByMaterial.get(m.id) ?? []
    const sectionCount = sections.length > 0 ? sections.length : Math.max(0, plan?.total_units ?? 0)
    const totalCells = sectionCount * rounds
    acc.totalCells += totalCells

    // 実績：全期間の完了セル数
    let completed = 0
    // 今日までの完了セル数
    let completedUntilToday = 0

    if (sections.length > 0) {
      for (const s of sections) {
        for (let r = 1; r <= rounds; r++) {
          const key = `${s.id}:${r}`
          const date = recordDateByKey.get(key)
          if (date) {
            completed += 1
            if (date <= todayISO) completedUntilToday += 1
          }
        }
      }
    }

    const actualPct = totalCells > 0 ? Math.round((completed / totalCells) * 100) : 0

    // 計画：今日までの計画セル数 & 計画％
    const { plannedCells, plannedPct } =
      totalCells > 0
        ? computePlannedCellsUntilToday(totalCells, plan?.start_date, plan?.end_date, todayISO)
        : { plannedCells: 0, plannedPct: 0 }

    if (totalCells > 0) {
      acc.actualSum += actualPct
      acc.plannedSum += plannedPct
      acc.denom += 1
      if (actualPct > 0 && actualPct < 100) acc.inProgressMaterials += 1
    }

    acc.plannedCellsUntilToday += plannedCells
    acc.actualCellsUntilToday += completedUntilToday

    // 期間のmin/max
    if (plan?.start_date) {
      acc.minStart = !acc.minStart || plan.start_date < acc.minStart ? plan.start_date : acc.minStart
    }
    if (plan?.end_date) {
      acc.maxEnd = !acc.maxEnd || plan.end_date > acc.maxEnd ? plan.end_date : acc.maxEnd
    }
  }

  const projects: ProjectView[] = projectsRaw.map(p => {
    const a = accByProject.get(p.id)!
    const plannedAvg = a.denom > 0 ? Math.round(a.plannedSum / a.denom) : 0
    const actualAvg = a.denom > 0 ? Math.round(a.actualSum / a.denom) : 0

    // 日数ラベル
    let daysLeftLabel = "—"
    if (a.maxEnd) {
      const end = parseISO(a.maxEnd)!
      const diff = Math.ceil((end.getTime() - parseISO(todayISO)!.getTime()) / 86400000)
      daysLeftLabel = diff >= 0 ? `残り ${diff}日` : `終了 ${-diff}日経過`
    }

    // 連続日数
    const streakDays = computeStreak(projectDateSets.get(p.id) ?? new Set<string>(), todayISO)

    return {
      id: String(p.id),
      slug: p.slug,
      name: p.name,
      category: p.category ?? "other",
      period: { from: a.minStart ? a.minStart.replaceAll("-", "/") : "—", to: a.maxEnd ? a.maxEnd.replaceAll("-", "/") : "—" },
      daysLeftLabel,
      materialsTotal: a.materialsTotal,
      plannedPct: plannedAvg,
      actualPct: actualAvg,
      inProgressMaterials: a.inProgressMaterials,
      totalCells: a.totalCells,
      plannedCellsUntilToday: a.plannedCellsUntilToday,
      actualCellsUntilToday: a.actualCellsUntilToday,
      streakDays,
    }
  })

  // サマリー（全体平均・合計）
  const totalProjects = projects.length
  const inProgressProjects = projects.filter(p => p.actualPct > 0 && p.actualPct < 100).length
  const avgPlannedPct = totalProjects > 0 ? Math.round(projects.reduce((s, p) => s + p.plannedPct, 0) / totalProjects) : 0
  const avgActualPct = totalProjects > 0 ? Math.round(projects.reduce((s, p) => s + p.actualPct, 0) / totalProjects) : 0
  const materialsTotalAll = projects.reduce((s, p) => s + p.materialsTotal, 0)
  const inProgressMaterialsAll = projects.reduce((s, p) => s + p.inProgressMaterials, 0)
  const plannedCellsUntilTodayAll = projects.reduce((s, p) => s + p.plannedCellsUntilToday, 0)
  const actualCellsUntilTodayAll = projects.reduce((s, p) => s + p.actualCellsUntilToday, 0)
  const todayRatePctAll = plannedCellsUntilTodayAll === 0
    ? 0
    : Math.round((actualCellsUntilTodayAll / plannedCellsUntilTodayAll) * 100)

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* プロジェクト数 */}

        <MaterialsNumCard title={"プロジェクト数"} totalMaterials={totalProjects} activeMaterials={inProgressProjects}></MaterialsNumCard>

        {/* 進捗率（平均）：上=計画(黒) / 下=実績(色) */}
        <ProgressRateCard avgActualPct={avgActualPct} avgPlannedPct={avgPlannedPct}></ProgressRateCard>

        {/* 今日までの進捗率 */}
        <CompletionTillTodayCard
          actualCellsUntilToday={actualCellsUntilTodayAll}
          plannedCellsUntilToday={plannedCellsUntilTodayAll}
          todayRatePct={todayRatePctAll}
        />
      </div>

      <AddButton href={"/add-project"} text={"プロジェクトを追加"} title={"プロジェクト一覧"} />

      {/* 一覧 */}
      <div className="space-y-3">
        {projects.map((p) => {
          const status =
            p.actualPct > p.plannedPct ? "ahead" : p.actualPct < p.plannedPct ? "behind" : "on"
          return (
            <Card key={p.id} className="mb-6 p-4 hover:bg-muted/30 transition-colors">
              <div className="gap-4">
                {/* 左 */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-xl border bg-card p-2">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <Link
                          href={`/project/${p.slug}`}
                          className="text-base font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                      </div>
                      <Badge variant="secondary" className="rounded-full">
                        {p.category}
                      </Badge>
                    </div>
                    <div className="flex justify-end md:self-start">
                      <Button asChild size="sm" variant="ghost" className="group">
                        <Link href={`/project/${p.slug}`}>
                          詳細を見る
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {p.period.from} — {p.period.to}
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="inline-flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      {p.daysLeftLabel}
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{p.materialsTotal > 0 ? `教材 ${p.materialsTotal}` : "ー"}</span>
                    </div>

                  </div>

                  {/* 進捗ダブルゲージ：上=計画(黒) / 下=実績(色) */}
                  <ProgressRateCard avgActualPct={p.actualPct} avgPlannedPct={p.plannedPct}></ProgressRateCard>

                </div>

              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
