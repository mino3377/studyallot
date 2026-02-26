// C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-material\action.ts
"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import {
  CreateMaterialPayload,
  assertNoOverlap,
  assertExactlyOneActive,
} from "@/lib/validators/material"
import { makePublicId } from "@/lib/slug"

export async function createMaterial(input: unknown) {
  const parsed = CreateMaterialPayload.safeParse(input)
  if (!parsed.success) {
    console.error("[Zod] issues:", parsed.error.flatten())
    return { ok: false, message: "入力値が不正です。必須項目や数値を確認してください。" }
  }

  const {
    title,
    total_units, project_id, section_titles = [],
    plans,
  } = parsed.data

  assertNoOverlap(plans)
  assertExactlyOneActive(plans)

  const supabase = await createClient()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return { ok: false, message: "ログインが必要です。" }

  const { data: proj, error: pErr } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (pErr || !proj) return { ok: false, message: "プロジェクトが見つからないか、権限がありません。" }

  const slug = makePublicId("m")


  const { data: mat, error: mErr } = await supabase
  .from("materials")
  .insert([{
    user_id: user.id,
    project_id,
    slug,
    title,
  }])
  .select("id, slug")
  .single()

  if (mErr) return { ok: false, message: `マテリアルの作成に失敗しました: ${mErr.message}` }

  const planRows = plans.map((p) => ({
    user_id: user.id,
    material_id: mat.id,
    name: p.name,
    total_units,
    rounds: p.rounds,
    start_date: p.start_date,
    end_date: p.end_date,
    is_active: !!p.is_active,
  }))
  const { error: planErr } = await supabase.from("plans").insert(planRows)
  if (planErr) return { ok: false, message: `スケジュールの作成に失敗しました: ${planErr.message}` }

  const n = Math.min(Math.max(total_units, 0), 100)
  const cleaned = (section_titles ?? []).map(s => (s ?? "").trim()).slice(0, n)
  const padded  = Array.from({ length: n }, (_, i) => cleaned[i] || `セクション${i + 1}`)
  if (n > 0) {
    const rows = padded.map((title, idx) => ({
      user_id: user.id,
      material_id: mat.id,
      order_key: idx + 1,
      title,
    }))
    const { error: sErr } = await supabase.from("sections").insert(rows)
    if (sErr) return { ok: false, message: `セクション名の登録に失敗しました: ${sErr.message}` }
  }

  redirect(`/material/${mat.slug}`)

}
