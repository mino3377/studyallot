//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[id]\page.tsx

import { assignmentForDate, toZonedISODate, /* 進捗%は既存のままでもOK */ } from "@/lib/daily-assignment"
import type { SectionLite } from "@/lib/daily-assignment"

import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Layers,
  ExternalLink,
  FileText,
  User,
  CheckCircle2,
  CalendarDays, // ★ 期間表示用
  Pencil,       // ★ 追加：編集アイコン
  Trash2,       // ★ 追加：削除アイコン
} from "lucide-react"
import MaterialCheckTable from "@/components/material-check-table"
import { saveSectionRecords } from "@/server/actions/sectionRecords";
import Link from "next/link"

// ★ 確認ダイアログ
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

// ★ オンザフライ計算ロジック
import {
  computePlannedCellsUntilToday,
} from "@/lib/study-schedule"
import ProgressRateCard from "@/components/progress-rate-card"

function fmtDate(d?: string | null) {
  if (!d) return "—"
  return d.slice(0, 10).replaceAll("-", "/")
}
function typeJa(t: "book" | "video" | "paper" | "web" | "other") {
  switch (t) {
    case "book": return "書籍"
    case "video": return "動画"
    case "paper": return "資料"
    case "web": return "Web"
    default: return "その他"
  }
}

/** ユーザーの想定TZを取得（profiles.timezone があれば使用。なければ Asia/Tokyo を既定） */
async function getUserTimeZone() {
  try {
    const sb = await createClient();
    const { data: auth } = await sb.auth.getUser();
    if (!auth?.user) return "Asia/Tokyo";
    // プロファイルに timezone カラムがある前提。無ければ JST 既定
    const { data: prof } = await sb
      .from("profiles")
      .select("timezone")
      .eq("id", auth.user.id)
      .single();
    return prof?.timezone || "Asia/Tokyo";
  } catch {
    return "Asia/Tokyo";
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 教材を先に取得して project_id を得る
  const { data: mat } = await supabase
    .from("materials")
    .select("title, project_id")
    .eq("id", Number(params.id))
    .single()

  // project_id からプロジェクト名を取得
  let projName: string | undefined = undefined
  if (mat?.project_id) {
    const { data: proj } = await supabase
      .from("projects")
      .select("name")
      .eq("id", mat.project_id)
      .single()
    projName = proj?.name ?? undefined
  }

  const title = mat?.title
    ? `${mat.title} | ${projName ?? "Project"} | studyallot`
    : "教材 | studyallot"

  return { title }
}

export default async function MaterialDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  // ★ 追加：ユーザーのTZ（未設定時は Asia/Tokyo）
  const userTZ = await getUserTimeZone();

  // 1) 教材詳細（まず教材を確定）
  const { data: matRow, error: matErr } = await supabase
    .from("materials")
    .select("id, title, source_type, author, link, notes, created_at, user_id, project_id")
    .eq("id", Number(params.id))
    .eq("user_id", auth.user.id)
    .single()

  if (matErr || !matRow) notFound()

  // 2) プロジェクト確認（教材の project_id から取得）
  const { data: projRow, error: projErr } = await supabase
    .from("projects")
    .select("id, name, slug, user_id")
    .eq("id", matRow.project_id)
    .eq("user_id", auth.user.id)
    .single()

  if (projErr || !projRow) notFound()

  // 3) プラン
  const { data: plansRows } = await supabase
    .from("plans")
    .select("id, total_units, rounds, start_date, end_date, is_active, user_id, material_id")
    .eq("material_id", matRow.id)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  const plan = (plansRows ?? []).find(p => p.is_active) ?? (plansRows ?? [])[0]
  const totalUnits = Number(plan?.total_units ?? 0)
  const rounds = Number(plan?.rounds ?? 1)

  // === セクションと既存記録 ================================================
  const { data: secRows } = await supabase
    .from("sections")
    .select("id, order_key, title, material_id, user_id")
    .eq("material_id", matRow.id)
    .eq("user_id", auth.user.id)
    .order("order_key", { ascending: true })

  let sections: SectionLite[] =
    (secRows?.map(s => ({
      id: s.id,
      order: s.order_key ?? 0,
      title: s.title ?? `セクション${s.order_key ?? ""}`,
    })) ?? [])

  if (sections.length === 0 && totalUnits > 0) {
    sections = Array.from({ length: totalUnits }, (_, i) => ({
      id: -(i + 1),
      order: i + 1,
      title: `セクション${i + 1}`,
    }))
  }

  const realSectionIds = sections.filter(s => s.id > 0).map(s => s.id)

  // 各 section_id×rap_no の「最新の recorded_on」
  let initialRecords: Record<string, string> = {}
  if (realSectionIds.length > 0) {
    const { data: recs } = await supabase
      .from("section_records")
      .select("section_id, rap_no, recorded_on, user_id")
      .eq("user_id", auth.user.id)
      .in("section_id", realSectionIds)

    for (const r of recs ?? []) {
      const k = `${r.section_id}:${r.rap_no}`
      const prev = initialRecords[k]
      if (!prev || r.recorded_on > prev) {
        initialRecords[k] = r.recorded_on // YYYY-MM-DD
      }
    }
  }

  // 実績進捗
  const totalCells = sections.filter(s => s.id > 0).length * rounds
  const completed = Object.keys(initialRecords).length
  const avgActualPct = totalCells > 0 ? Math.round((completed / totalCells) * 100) : 0

  // === 計画：本日の割当 & 今日までの計画進捗 ==============================
  const startISO = plan?.start_date ?? null
  const endISO = plan?.end_date ?? null
  const todayISO = toZonedISODate(new Date(), userTZ) // ★ TZ統一（ユーザー現地日付）

  const todaysAssignment = (startISO && endISO && totalCells > 0)
    ? assignmentForDate(sections, rounds, startISO, endISO, todayISO, userTZ)
    : []

  const planned = (startISO && endISO && totalCells > 0)
    ? computePlannedCellsUntilToday(totalCells, startISO, endISO, todayISO)
    : { plannedCells: 0, plannedPct: 0, dayIndex: -1, totalDays: 0 }

  const avgPlannedPct = planned.plannedPct

  // === 削除アクション（確認後に呼ばれる） ================================
  // ★ 非null値を束縛（クロージャ内での TS narrowing の崩れを回避）
  const matId = matRow.id
  const projSlug = projRow.slug

  async function deleteMaterialAction() {
    "use server"
    const supa = await createClient()
    const { data: auth2 } = await supa.auth.getUser()
    if (!auth2?.user) redirect("/login")

    // 依存レコードを先に削除（FK で CASCADE 設定済みなら不要）
    await supa.from("section_records").delete().eq("user_id", auth2.user.id).in(
      "section_id",
      (await supa.from("sections").select("id").eq("material_id", matId).eq("user_id", auth2.user.id)).data?.map(x => x.id) ?? [-1]
    )

    await supa.from("sections").delete().eq("user_id", auth2.user.id).eq("material_id", matId)
    await supa.from("plans").delete().eq("user_id", auth2.user.id).eq("material_id", matId)

    // 本体を削除
    const { error } = await supa.from("materials").delete()
      .eq("user_id", auth2.user.id)
      .eq("id", matId)

    if (error) throw new Error(error.message)

    // プロジェクト詳細へ戻す
    redirect(`/project/${projSlug}`)
  }

  // === ★追加：MaterialCheckTable の型に合わせた保存アダプタ（Promise<void> に統一） ===
  async function saveSectionRecordsAction(fd: FormData) {
    "use server"
    await saveSectionRecords(fd)
  }

  // カラー決定：前倒し=緑 / 予定通り=黄色 / 遅れ=赤
  const status: "ahead" | "on" | "behind" =
    avgActualPct > avgPlannedPct ? "ahead" : avgActualPct < avgPlannedPct ? "behind" : "on"

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div className="font-bold text-2xl">
          {matRow.title}
        </div>
        <div className="flex space-y-1 gap-2">
          <Badge variant="secondary" className="rounded-full">
            {typeJa(matRow.source_type)}
          </Badge>
          <div className="text-sm text-muted-foreground">{projRow.name}</div>
        </div>

        {/* 右上アクション */}
        {matRow.link && (
          <Button asChild variant="ghost" size="sm" className="group">
            <a href={matRow.link} target="_blank" rel="noreferrer">
              参考リンクを開く
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      {/* ★ 期間 + 右側に 編集/削除 */}
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {fmtDate(plan?.start_date)} — {fmtDate(plan?.end_date)}
        </div>

        <div className="flex items-center gap-1">
          {/* 編集へ */}
          <Button asChild variant="ghost" size="sm" title="編集">
            <Link href={`/material/${matId}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>

        {/* 削除（確認ダイアログ） */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" title="削除" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>このマテリアルを削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  関連するスケジュール・セクション・学習記録も削除されます。この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  formAction={deleteMaterialAction}
                >
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {matRow?.author && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          {matRow.author}
        </div>
      )}

      {matRow?.notes && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mt-0.5" />
          <div className="whitespace-pre-wrap break-words">
            {matRow.notes}
          </div>
        </div>
      )}

      {/* ★ NEW：本日の割当（計画） */}
      {(totalCells > 0) ? (
        <Card className="p-4 space-y-1 gap-1">
          <div className="text-l font-medium">
            本日のタスク（{todayISO}）
          </div>
          {todaysAssignment.length === 0 ? (
            <div className="text-sm text-muted-foreground">なし</div>
          ) : (
            <div className="text-sm ml-1.5">
              {Object.entries(
                todaysAssignment.reduce<Record<string, string[]>>((acc, c) => {
                  const k = `${c.round}周目`
                  acc[k] = acc[k] ?? []
                  acc[k].push(c.title)
                  return acc
                }, {})
              ).map(([k, titles]) => (
                <div key={k} className="mt-1">
                  <span className="font-medium">{k}：</span>
                  <span className="text-muted-foreground">
                    {titles.join("、")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            セクションまたは周回数が未設定です
          </div>
        </Card>
      )}

      {/* 上段：進捗カード（※ 進捗カードのみ） */}
      <div className="grid gap-4 sm:grid-cols-1">
        <ProgressRateCard avgActualPct={avgActualPct} avgPlannedPct={avgPlannedPct}></ProgressRateCard>
      </div>

      {/* ★ チェック表（総セクション×周回はここで使い回し表示へ） */}
      <MaterialCheckTable
        materialId={matId}
        rounds={rounds}
        sections={sections}
        initialRecords={initialRecords}
        todayISO={todayISO}
        saveAction={saveSectionRecordsAction}
      />
    </div>
  )
}
