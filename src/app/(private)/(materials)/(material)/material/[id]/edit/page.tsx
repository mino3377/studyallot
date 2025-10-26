//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[id]\edit\page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import EditMaterialClient from "./EditMaterialClient"
import { EditMaterialPayload } from "@/lib/validators/material"

export default async function EditMaterialPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const mid = Number(params.id)

  // 現状読み込み（materials / plans / sections）
  const { data: mat } = await supabase
    .from("materials")
    .select("id, user_id, project_id, title, source_type, author, link, notes")
    .eq("id", mid).eq("user_id", user.id).maybeSingle()
  if (!mat) notFound()

  const { data: planRows } = await supabase
    .from("plans")
    .select("id, total_units, rounds, start_date, end_date, is_active")
    .eq("material_id", mid).eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const plan = (planRows ?? []).find(p => p.is_active) ?? (planRows ?? [])[0] ?? null

  const { data: secRows } = await supabase
    .from("sections")
    .select("id, order_key, title")
    .eq("material_id", mid).eq("user_id", user.id)
    .order("order_key", { ascending: true })

  // ★ タイトルと一緒に ID も渡す（順序保持のため）
  const sectionIds = (secRows ?? []).map(s => s.id)
  const sectionTitles = (secRows ?? []).map(s => s.title ?? `セクション${s.order_key ?? ""}`)

  // プロジェクト候補（セレクト）
  const { data: projectRows } = await supabase
    .from("projects").select("id, name").eq("user_id", user.id).order("name", { ascending: true })
  const projects = (projectRows ?? []).map(p => ({ id: String(p.id), name: p.name }))

  // 更新アクション（IDベースの差分更新を含む完全版）
  async function updateMaterialAction(input: any) {
    "use server"

    const supa = await createClient()
    const { data: { user: u } } = await supa.auth.getUser()
    if (!u) redirect("/login")

    const parsed = EditMaterialPayload.safeParse(input)
    if (!parsed.success) {
      throw new Error("入力値が不正です。必須項目・数値を確認してください。")
    }

    // ★ バリデータ外で section_ids を受け取る（任意）
    const incomingSectionIds: number[] | null =
      Array.isArray((input as any)?.section_ids)
        ? (input as any).section_ids
            .map((x: any) => Number(x))
            .filter((x: number) => Number.isInteger(x) && x >= 0) // 0 は「新規」を許容
        : null

    const {
      title, source_type, author, link, notes,
      start_date, end_date, total_units, rounds,
      project_id, section_titles = [],
    } = parsed.data

    // 所有確認
    const { data: matCheck } = await supa
      .from("materials")
      .select("id, project_id")
      .eq("id", mid).eq("user_id", u.id).maybeSingle()
    if (!matCheck) notFound()

    // materials 更新（プロジェクトの移動も対応）
    {
      const { error: mErr } = await supa.from("materials").update({
        title,
        source_type,
        author: author ?? null,
        link: link ?? null,
        notes: notes ?? null,
        project_id,
      }).eq("id", mid).eq("user_id", u.id)
      if (mErr) throw new Error(`更新に失敗しました: ${mErr.message}`)
    }

    // plans：アクティブがあれば更新、無ければ作成。旧 rounds を保持しておく
    const { data: existingPlans } = await supa
      .from("plans")
      .select("id, is_active, rounds")
      .eq("material_id", mid).eq("user_id", u.id).order("created_at", { ascending: false })

    const activePlan = (existingPlans ?? []).find(p => p.is_active) ?? null
    const oldRounds = Number(activePlan?.rounds ?? plan?.rounds ?? rounds)

    if (activePlan) {
      const { error: pErr } = await supa.from("plans").update({
        total_units, rounds, start_date, end_date, is_active: true,
      }).eq("id", activePlan.id).eq("user_id", u.id)
      if (pErr) throw new Error(`スケジュール更新に失敗しました: ${pErr.message}`)
    } else {
      const { error: pErr } = await supa.from("plans").insert([{
        user_id: u.id, material_id: mid,
        total_units, rounds, start_date, end_date, is_active: true,
      }])
      if (pErr) throw new Error(`スケジュール作成に失敗しました: ${pErr.message}`)
    }

    // sections：IDベースの差分更新
    const { data: existingSecs } = await supa
      .from("sections")
      .select("id, order_key, title")
      .eq("material_id", mid).eq("user_id", u.id)
      .order("order_key", { ascending: true })

    const ex = existingSecs ?? []
    const n = Math.min(Math.max(total_units, 0), 200)
    const cleaned = (section_titles ?? []).map(s => (s ?? "").trim()).slice(0, n)
    const padded = Array.from({ length: n }, (_, i) => cleaned[i] || `セクション${i + 1}`)

    type Wanted = { id: number | null; title: string; order_key: number }
    let wanted: Wanted[] = []

    if (incomingSectionIds && incomingSectionIds.length === n) {
      // クライアントから順序確定済みの ID が来ている
      wanted = padded.map((title, i) => ({
        id: incomingSectionIds[i] && incomingSectionIds[i] !== 0 ? incomingSectionIds[i] : null,
        title,
        order_key: i + 1,
      }))
    } else {
      // 後方互換：IDが無い場合は「位置ベース」で既存のi番目のIDを採用
      wanted = padded.map((title, i) => ({
        id: ex[i]?.id ?? null,
        title,
        order_key: i + 1,
      }))
    }

    const existingIds = new Set(ex.map(r => r.id))
    const wantedIds = new Set(wanted.map(w => w.id!).filter(Boolean) as number[])

    // 1) UPDATE: id がある wanted 行は、その id の title/order_key を更新
    for (const w of wanted) {
      if (w.id && existingIds.has(w.id)) {
        const cur = ex.find(r => r.id === w.id)!
        if (cur.title !== w.title || cur.order_key !== w.order_key) {
          const { error } = await supa
            .from("sections")
            .update({ title: w.title, order_key: w.order_key })
            .eq("id", w.id).eq("user_id", u.id)
          if (error) throw new Error(`セクション更新に失敗しました: ${error.message}`)
        }
      }
    }

    // 2) INSERT: wanted のうち id が null の位置は新規作成
    const toInsert: { user_id: string; material_id: number; order_key: number; title: string }[] = []
    for (const w of wanted) {
      if (!w.id) {
        toInsert.push({ user_id: u.id, material_id: mid, order_key: w.order_key, title: w.title })
      }
    }
    if (toInsert.length > 0) {
      const { error } = await supa.from("sections").insert(toInsert)
      if (error) throw new Error(`セクション追加に失敗しました: ${error.message}`)
    }

    // 3) DELETE: 既存のうち、wanted に存在しない id は削除（＝削除されたセクション）
    const toDeleteIds = ex.map(r => r.id).filter(id => !wantedIds.has(id))
    if (toDeleteIds.length > 0) {
      // 先に記録を消す（CASCADE でない場合でも整合が取れるように）
      const { error: rErr } = await supa
        .from("section_records")
        .delete()
        .in("section_id", toDeleteIds)
        .eq("user_id", u.id)
      if (rErr) throw new Error(`削除済みセクションの記録削除に失敗しました: ${rErr.message}`)

      const { error } = await supa.from("sections").delete().in("id", toDeleteIds).eq("user_id", u.id)
      if (error) throw new Error(`余剰セクション削除に失敗しました: ${error.message}`)
    }

    // 4) rounds を減らした場合：rap_no > rounds の記録を削除（現存セクションに対して）
    const newRounds = Number(rounds)
    if (newRounds < Number(oldRounds)) {
      const { data: secsNow } = await supa.from("sections").select("id").eq("material_id", mid).eq("user_id", u.id)
      const secIdsNow = (secsNow ?? []).map(s => s.id)
      if (secIdsNow.length > 0) {
        const { error } = await supa
          .from("section_records")
          .delete()
          .gt("rap_no", newRounds)
          .in("section_id", secIdsNow)
          .eq("user_id", u.id)
        if (error) throw new Error(`周回数超過の記録削除に失敗しました: ${error.message}`)
      }
    }

    // 完了
    redirect(`/material/${mid}`)
  }

  return (
    <EditMaterialClient
      action={updateMaterialAction}
      projects={projects}
      initial={{
        id: String(mat.id),
        project_id: String(mat.project_id),
        title: mat.title,
        source_type: mat.source_type as "book" | "video" | "paper" | "web" | "other",
        author: mat.author ?? "",
        link: mat.link ?? "",
        notes: mat.notes ?? "",
        start_date: plan?.start_date ?? "",
        end_date: plan?.end_date ?? "",
        total_units: Number(plan?.total_units ?? 0),
        rounds: Number(plan?.rounds ?? 1),
        section_titles: sectionTitles,
        // ★ 追加
        section_ids: sectionIds,
      }}
    />
  )
}
