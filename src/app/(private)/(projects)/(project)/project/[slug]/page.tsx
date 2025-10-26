// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\page.tsx

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import AddButton from "@/components/add-button"
import { createClient } from "@/utils/supabase/server"
import MaterialsList from "./materials-list"

// ★ 進捗・日割りユーティリティ
import {
  toLocalISODate,
  computePlannedCellsUntilToday,
} from "@/lib/progress-alloc"

// サマリー用カード（全体ページと同じUI）
import MaterialsNumCard from "@/components/materials-num-card"
import ProgressRateCard from "@/components/progress-rate-card"
import CompletionTillTodayCard from "@/components/conpletion-till-today-card"
import { CalendarDays, Target, Timer, Pencil, Trash2 } from "lucide-react"

// 追加：削除確認ダイアログ（shadcn）
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

function fmtDateYYYYMMDDSlash(d?: string | null) {
  if (!d) return ""
  return d.slice(0, 10).replaceAll("-", "/")
}

function formatLastActive(created_at?: string | null) {
  if (!created_at) return "-"
  const d = new Date(created_at)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${y}/${m}/${day} ${hh}:${mm}`
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("projects")
    .select("name")
    .eq("slug", params.slug)
    .single()

  return { title: data?.name ? `${data.name} | studyallot` : "Project | studyallot" }
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  // 1) プロジェクト1件（ユーザー所有のものだけ）
  const { data: projRow, error: projErr } = await supabase
    .from("projects")
    .select("id, slug, name, goal, created_at, user_id")
    .eq("slug", params.slug)
    .eq("user_id", auth.user.id)
    .single()

  if (projErr || !projRow) notFound()

  // ★ 非nullを外側の定数に束縛（ネスト関数でも安全に使える）
  const projectId = projRow.id
  const projectSlug = projRow.slug

  // 追加：削除アクション（サーバーアクション）
  async function deleteProjectAction() {
    "use server"
    const supa = await createClient()
    const { data: auth2 } = await supa.auth.getUser()
    if (!auth2?.user) redirect("/login")

    const { error } = await supa
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", auth2.user.id)

    if (error) {
      throw new Error(error.message)
    }

    redirect("/project")
  }

  // 2) 教材
  const { data: mats } = await supabase
    .from("materials")
    .select("id, title, source_type, author, link, created_at, user_id, project_id")
    .eq("project_id", projectId)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  const materials = mats ?? []
  const materialIds = materials.map(m => m.id)

  // 3) プラン（is_active 優先 → なければ最新）
  let latestPlanByMaterial = new Map<number, {
    total_units: number | null
    rounds: number | null
    start_date: string | null
    end_date: string | null
  } | undefined>()

  if (materialIds.length > 0) {
    const { data: planRows } = await supabase
      .from("plans")
      .select("material_id, total_units, rounds, start_date, end_date, is_active, user_id, created_at")
      .in("material_id", materialIds)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })

    const groups = new Map<number, any[]>()
    for (const p of planRows ?? []) {
      const arr = groups.get(p.material_id) ?? []
      arr.push(p)
      groups.set(p.material_id, arr)
    }
    for (const mId of materialIds) {
      const list = groups.get(mId) ?? []
      const active = list.find((x) => x?.is_active === true)
      latestPlanByMaterial.set(mId, active ?? list[0])
    }
  }

  // 4) セクション
  const sectionByMaterial = new Map<number, { id: number; order_key: number | null }[]>()
  const allSectionIds: number[] = []
  if (materialIds.length > 0) {
    const { data: secRows } = await supabase
      .from("sections")
      .select("id, material_id, order_key")
      .in("material_id", materialIds)
      .eq("user_id", auth.user.id)
      .order("order_key", { ascending: true })

    for (const s of secRows ?? []) {
      const arr = sectionByMaterial.get(s.material_id) ?? []
      arr.push(s)
      sectionByMaterial.set(s.material_id, arr)
      allSectionIds.push(s.id)
    }
  }

  // 5) 実績（section_records） -> 完了セル数/今日までの完了セル数
  const todayISO = toLocalISODate(new Date())
  const recordDateByKey = new Map<string, string>() // `${section_id}:${rap_no}` -> 'YYYY-MM-DD'
  if (allSectionIds.length > 0) {
    const { data: recs } = await supabase
      .from("section_records")
      .select("section_id, rap_no, recorded_on")
      .eq("user_id", auth.user.id)
      .in("section_id", allSectionIds)

    for (const r of recs ?? []) {
      recordDateByKey.set(`${r.section_id}:${r.rap_no}`, r.recorded_on)
    }
  }

  // 6) 教材VM化＆プロジェクト集計
  type VM = {
    id: number | string
    title: string
    type: "book" | "video" | "paper" | "web" | "other"
    startDate: string
    endDate: string
    totalUnits: number
    lapsNow: number
    lapsTotal: number
    plannedPct: number
    actualPct: number
  }

  let projectMinStart: string | undefined
  let projectMaxEnd: string | undefined

  let projectPlannedPctSum = 0
  let projectActualPctSum = 0
  let projectPctDenom = 0

  let projectPlannedCellsUntilToday = 0
  let projectActualCellsUntilToday = 0

  const materialsVM: VM[] = materials.map((m: any) => {
    const p = latestPlanByMaterial.get(m.id) ?? undefined
    const rounds = Math.max(1, Number(p?.rounds ?? 1))
    const sections = sectionByMaterial.get(m.id) ?? []
    const sectionCount = sections.length > 0 ? sections.length : Math.max(0, Number(p?.total_units ?? 0))
    const totalCells = sectionCount * rounds

    // 実績セル数（全期間）/ 今日まで
    let completedTotal = 0
    let completedUntilToday = 0
    for (const s of sections) {
      for (let r = 1; r <= rounds; r++) {
        const key = `${s.id}:${r}`
        const rec = recordDateByKey.get(key)
        if (rec) {
          completedTotal += 1
          if (rec <= todayISO) completedUntilToday += 1
        }
      }
    }

    // 計画セル（今日まで）＆計画％
    const { plannedCells, plannedPct } =
      totalCells > 0
        ? computePlannedCellsUntilToday(totalCells, p?.start_date ?? null, p?.end_date ?? null, todayISO)
        : { plannedCells: 0, plannedPct: 0 }

    const actualPct = totalCells > 0 ? Math.round((completedTotal / totalCells) * 100) : 0

    if (totalCells > 0) {
      projectPlannedPctSum += plannedPct
      projectActualPctSum += actualPct
      projectPctDenom += 1
    }

    projectPlannedCellsUntilToday += plannedCells
    projectActualCellsUntilToday += completedUntilToday

    // 期間の最小/最大
    if (p?.start_date) {
      projectMinStart = !projectMinStart || p.start_date < projectMinStart ? p.start_date : projectMinStart
    }
    if (p?.end_date) {
      projectMaxEnd = !projectMaxEnd || p.end_date > projectMaxEnd ? p.end_date : projectMaxEnd
    }

    return {
      id: m.id,
      title: m.title,
      type: m.source_type,
      startDate: fmtDateYYYYMMDDSlash(p?.start_date),
      endDate: fmtDateYYYYMMDDSlash(p?.end_date),
      totalUnits: sectionCount,
      lapsNow: 0,
      lapsTotal: rounds,
      plannedPct,
      actualPct,
    }
  })

  // 7) ヘッダー用
  const project = {
    slug: projectSlug as string,
    name: projRow.name as string,
    period: {
      from: projectMinStart ? fmtDateYYYYMMDDSlash(projectMinStart) : "—",
      to: projectMaxEnd ? fmtDateYYYYMMDDSlash(projectMaxEnd) : "—",
    },
    goalLabel: (projRow.goal as string) ?? "",
    lastActive: formatLastActive(projRow.created_at as string),
  }

  // 8) 上段カード用の集計（全体ページのやり方を、このプロジェクトだけに限定して適用）
  const totalMaterials = materialsVM.length
  const activeMaterials = materialsVM.filter((m) => m.actualPct > 0 && m.actualPct < 100).length

  const avgPlannedPct =
    projectPctDenom > 0 ? Math.round(projectPlannedPctSum / projectPctDenom) : 0
  const avgActualPct =
    projectPctDenom > 0 ? Math.round(projectActualPctSum / projectPctDenom) : 0

  const todayRatePct =
    projectPlannedCellsUntilToday === 0
      ? 0
      : Math.round((projectActualCellsUntilToday / projectPlannedCellsUntilToday) * 100)

  return (
    <div className="space-y-6">
      {/* ヘッダー（全体ページと同じ見せ方） */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {project.period.from} — {project.period.to}
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              {project.goalLabel || "—"}
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-4 w-4" />
              最終学習：{project.lastActive}
            </span>
          </div>
        </div>

        {/* 右端：編集／削除 */}
        <div className="flex items-center gap-2">
          {/* 編集へ遷移 */}
          <Button asChild variant="ghost" size="icon" title="編集">
            <Link href={`/project/${project.slug}/edit`}>
              <Pencil className="h-5 w-5" />
            </Link>
          </Button>

          {/* 削除：確認ダイアログ → サーバーアクション */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="削除" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  このプロジェクトを削除すると、関連するデータも削除される場合があります。元に戻せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <form action={deleteProjectAction}>
                  <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700">
                    削除する
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 上段：統計カード（全体ページと同じUI・このプロジェクトの数字） */}
      <div className="grid sm:gap-2 md:gap-4 sm:grid-cols-3">
        <MaterialsNumCard totalMaterials={totalMaterials} activeMaterials={activeMaterials} />
        <ProgressRateCard avgActualPct={avgActualPct} avgPlannedPct={avgPlannedPct} />
        <CompletionTillTodayCard
          actualCellsUntilToday={projectActualCellsUntilToday}
          plannedCellsUntilToday={projectPlannedCellsUntilToday}
          todayRatePct={todayRatePct}
        />
      </div>

      <AddButton href={"/add-textbook"} text={"マテリアルを追加"} title={"マテリアル一覧"} />

      {/* 教材一覧 */}
      <MaterialsList materials={materialsVM} slug={params.slug} />
    </div>
  )
}
