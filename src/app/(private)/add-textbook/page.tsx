// C:\Users\chiso\nextjs\study-allot\src\server\actions\materials.ts

"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CreateMaterialPayload } from "@/lib/validators/material"
import { assertNoOverlap, normalizeActive } from "@/lib/materials/plans"

export async function createMaterial(input: unknown): Promise<void> {
  const parsed = CreateMaterialPayload.safeParse(input)
  if (!parsed.success) {
    console.error("[Zod] issues:", parsed.error.flatten())
    throw new Error("入力値が不正です。必須項目や数値を確認してください。")
  }

  const {
    title, source_type, author, link, notes,
    total_units, project_id, section_titles = [],
    plans,
  } = parsed.data

  // 検証・正規化
  assertNoOverlap(plans)
  const todayISO = new Date().toISOString().slice(0, 10)
  const normalized = normalizeActive(plans, todayISO)

  const supabase = await createClient()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) throw new Error("ログインが必要です。")

  // プロジェクト所有チェック
  const { data: proj, error: pErr } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (pErr || !proj) throw new Error("プロジェクトが見つからないか、権限がありません。")

  // 1) materials
  const { data: mat, error: mErr } = await supabase
    .from("materials")
    .insert([{
      user_id: user.id,
      project_id,
      title,
      source_type,
      author: author ?? null,
      link: link ?? null,
      notes: notes ?? null,
    }])
    .select("id")
    .single()
  if (mErr) throw new Error(`マテリアルの作成に失敗しました: ${mErr.message}`)

  // 2) plans（複数）
  const planRows = normalized.map((p) => ({
    user_id: user.id,
    material_id: mat.id,
    name: p.name,
    total_units,
    rounds: p.rounds,
    start_date: p.start_date,
    end_date: p.end_date,
    is_active: p.is_active ?? false,
  }))
  const { error: planErr } = await supabase.from("plans").insert(planRows)
  if (planErr) throw new Error(`スケジュールの作成に失敗しました: ${planErr.message}`)

  // 3) sections（共通）
  const n = Math.min(Math.max(total_units, 0), 200)
  const cleaned = (section_titles ?? []).map(s => (s ?? "").trim()).slice(0, n)
  const padded = Array.from({ length: n }, (_, i) => cleaned[i] || `セクション${i + 1}`)
  if (n > 0) {
    const rows = padded.map((title, idx) => ({
      user_id: user.id,
      material_id: mat.id,
      order_key: idx + 1,
      title,
    }))
    const { error: sErr } = await supabase.from("sections").insert(rows)
    if (sErr) throw new Error(`セクション名の登録に失敗しました: ${sErr.message}`)
  }

  redirect("/project")
}
