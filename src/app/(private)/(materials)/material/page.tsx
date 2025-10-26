// app/(private)/(materials)/material/page.tsx

import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Target, Timer, BarChart3, Layers, CheckCircle2 } from "lucide-react"
import AddButton from "@/components/add-button"
import { createClient } from "@/utils/supabase/server"
import MaterialsList from "./materials-list"

// ★ 進捗・日割りユーティリティ（プロジェクト版と同じ）
import {
  toLocalISODate,
  computePlannedCellsUntilToday,
} from "@/lib/progress-alloc"
import MaterialsNumCard from "@/components/materials-num-card"
import ProgressRateCard from "@/components/progress-rate-card"
import CompletionTillTodayCard from "@/components/conpletion-till-today-card"

function fmtDateYYYYMMDDSlash(d?: string | null) {
  if (!d) return "—"
  return d.slice(0, 10).replaceAll("-", "/")
}

export const metadata = {
  title: "Materials | studyallot",
}

export default async function MaterialsAllPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  // 1) ユーザーの全教材（プロジェクトを問わない）
  const { data: mats } = await supabase
    .from("materials")
    .select("id, title, source_type, author, link, created_at, user_id, project_id")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  const materials = mats ?? []
  const materialIds = materials.map((m) => m.id)

  // 2) プラン（is_active 優先 → なければ最新）
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

  // 3) セクション
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

  // 4) 実績（section_records）
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

  // 5) VM 化（プロジェクト版と同じ算出ロジック）
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

  let globalMinStart: string | undefined
  let globalMaxEnd: string | undefined

  let plannedPctSum = 0
  let actualPctSum = 0
  let pctDenom = 0

  let plannedCellsUntilToday = 0
  let actualCellsUntilToday = 0

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
      plannedPctSum += plannedPct
      actualPctSum += actualPct
      pctDenom += 1
    }

    plannedCellsUntilToday += plannedCells
    actualCellsUntilToday += completedUntilToday

    // 全体期間（最小開始〜最大終了）
    if (p?.start_date) {
      globalMinStart = !globalMinStart || p.start_date < globalMinStart ? p.start_date : globalMinStart
    }
    if (p?.end_date) {
      globalMaxEnd = !globalMaxEnd || p.end_date > globalMaxEnd ? p.end_date : globalMaxEnd
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

  // 6) 上段カードの集計（プロジェクト版と同じ）
  const totalMaterials = materialsVM.length
  const activeMaterials = materialsVM.filter((m) => m.actualPct > 0 && m.actualPct < 100).length

  const avgPlannedPct = pctDenom > 0 ? Math.round(plannedPctSum / pctDenom) : 0
  const avgActualPct  = pctDenom > 0 ? Math.round(actualPctSum  / pctDenom) : 0

  const todayRatePct =
    plannedCellsUntilToday === 0
      ? 0
      : Math.round((actualCellsUntilToday / plannedCellsUntilToday) * 100)

  const status =
    avgActualPct > avgPlannedPct ? "ahead" : avgActualPct < avgPlannedPct ? "behind" : "on"

  // 7) 画面描画
  return (
    <div className="space-y-6">
      {/* ヘッダー（全体期間は最小開始〜最大終了） */}
      <div className="flex items-start justify-between gap-4">
        <div>
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {globalMinStart ? fmtDateYYYYMMDDSlash(globalMinStart) : "—"} — {globalMaxEnd ? fmtDateYYYYMMDDSlash(globalMaxEnd) : "—"}
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* 上段：統計カード（3枚） */}
      <div className="grid gap-2 sm:gap-4 grid-cols-3">
        {/* 1) 教材数 */}
       <MaterialsNumCard totalMaterials={totalMaterials} activeMaterials={activeMaterials}></MaterialsNumCard>

        {/* 2) 進捗率（上=計画〈黒〉 / 下=実績〈色〉） */}
        <ProgressRateCard avgActualPct={avgActualPct} avgPlannedPct={avgPlannedPct}></ProgressRateCard>

        {/* 3) 今日までの完了（実績/目標） */}
        <CompletionTillTodayCard actualCellsUntilToday={actualCellsUntilToday} plannedCellsUntilToday={plannedCellsUntilToday} todayRatePct={todayRatePct}></CompletionTillTodayCard>
      </div>

      <AddButton href={"/add-textbook"} text={"マテリアルを追加"} title={"マテリアル一覧"} />

      {/* 教材一覧（全プロジェクト横断） */}
      <MaterialsList materials={materialsVM} />
    </div>
  )
}
