// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[slug]\edit\actions.ts
"use server"

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import {
  EditMaterialPayload,
  assertNoOverlap,
  assertExactlyOneActive,
} from "@/lib/validators/material"
import type { UpdateMaterialInput } from "@/lib/type/material"

export async function updateMaterialAction(materialId: number, inputOrig: UpdateMaterialInput) {
  const supa = await createClient()
  const { data: { user } } = await supa.auth.getUser()
  if (!user) redirect("/login")

  const input = inputOrig

  const parsed = EditMaterialPayload.safeParse(input)
  if (!parsed.success) {
    console.error("[EditMaterialAction] Zod errors (flatten):", parsed.error.flatten())
    console.error("[EditMaterialAction] Zod issues:", parsed.error.issues)
    throw new Error("入力値が不正です。必須項目・数値を確認してください。")
  }

  const {
    title, notes,total_units, rounds,
    project_id, section_titles = [],
  } = parsed.data

  const { data: matCheck } = await supa
    .from("materials")
    .select("id, slug, project_id")
    .eq("id", materialId).eq("user_id", user.id).maybeSingle()
  if (!matCheck) notFound()

  {
    const { error } = await supa.from("materials").update({
      title,
      notes: notes || null,
      project_id,
    }).eq("id", materialId).eq("user_id", user.id)
    if (error) throw new Error(`更新に失敗しました: ${error.message}`)
  }

  const incoming = (input.plans ?? []).map(p => ({
    idNum: /^\d+$/.test(p.id) ? Number(p.id) : null,
    rawId: p.id,
    name: (p.name ?? "").trim() || null,
    start_date: (p.startDate ?? "") || null,
    end_date: (p.endDate ?? "") || null,
    rounds: typeof p.rounds === "number" ? Math.max(1, Math.min(100, p.rounds)) : 1,
    is_active: !!p.isActive,
  }))

  const comparableForCheck = incoming.map(p => ({
    name: p.name || "",
    start_date: p.start_date || "",
    end_date: p.end_date || "",
    rounds: p.rounds,
    is_active: p.is_active,
  }))
  assertNoOverlap(comparableForCheck)
  assertExactlyOneActive(comparableForCheck)

  const { data: existingPlansRaw } = await supa
    .from("plans")
    .select("id, name, total_units, rounds, start_date, end_date, is_active")
    .eq("material_id", materialId).eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const existing = existingPlansRaw ?? []
  const existingMap = new Map(existing.map(p => [p.id, p]))

  const planTotalUnits = Math.max(0, Math.min(200, total_units))

  for (const inc of incoming) {
    if (inc.idNum && existingMap.has(inc.idNum)) {
      const ex = existingMap.get(inc.idNum)!
      const needUpdate =
        (ex.name ?? null) !== inc.name ||
        (ex.total_units ?? null) !== planTotalUnits ||
        Number(ex.rounds) !== Number(inc.rounds) ||
        (ex.start_date ?? null) !== inc.start_date ||
        (ex.end_date ?? null) !== inc.end_date ||
        Boolean(ex.is_active) !== inc.is_active

      if (needUpdate) {
        const { error: upErr } = await supa.from("plans").update({
          name: inc.name,
          total_units: planTotalUnits,
          rounds: inc.rounds,
          start_date: inc.start_date,
          end_date: inc.end_date,
          is_active: inc.is_active,
        }).eq("id", inc.idNum).eq("user_id", user.id)
        if (upErr) throw new Error(`プラン更新に失敗しました(ID:${inc.idNum}): ${upErr.message}`)
      }
    } else {
      const { error: insErr } = await supa.from("plans").insert([{
        user_id: user.id,
        material_id: materialId,
        name: inc.name,
        total_units: planTotalUnits,
        rounds: inc.rounds,
        start_date: inc.start_date,
        end_date: inc.end_date,
        is_active: inc.is_active,
      }])
      if (insErr) throw new Error(`プラン作成に失敗しました: ${insErr.message}`)
    }
  }

  const deletedSet = new Set<number>(input.deleted_plan_ids ?? [])
  if (deletedSet.size > 0) {
    const toDelete = Array.from(deletedSet).filter(id => existingMap.has(id))
    if (toDelete.length > 0) {
      const { error: delErr } = await supa
        .from("plans")
        .delete()
        .in("id", toDelete)
        .eq("user_id", user.id)
      if (delErr) throw new Error(`プラン削除に失敗しました: ${delErr.message}`)
    }
  }

  const { data: existingSecs } = await supa
    .from("sections")
    .select("id, order_key, title")
    .eq("material_id", materialId).eq("user_id", user.id)
    .order("order_key", { ascending: true })

  const ex = existingSecs ?? []
  const n = Math.min(Math.max(total_units, 0), 200)
  const cleaned = (section_titles ?? []).map(s => (s ?? "").trim()).slice(0, n)
  const padded = Array.from({ length: n }, (_, i) => cleaned[i] || `セクション${i + 1}`)

  const incomingIds = Array.isArray(input.section_ids) ? input.section_ids : []
  type Wanted = { id: number | null; title: string; order_key: number }
  const wanted: Wanted[] =
    incomingIds.length === n
      ? padded.map((title, i) => ({
        id: incomingIds[i] && incomingIds[i] !== 0 ? Number(incomingIds[i]) : null,
        title, order_key: i + 1,
      }))
      : padded.map((title, i) => ({
        id: ex[i]?.id ?? null,
        title, order_key: i + 1,
      }))

  const existingIds = new Set(ex.map(r => r.id))
  const wantedIds = new Set(wanted.map(w => w.id!).filter(Boolean) as number[])

  for (const w of wanted) {
    if (w.id && existingIds.has(w.id)) {
      const cur = ex.find(r => r.id === w.id)!
      if (cur.title !== w.title || cur.order_key !== w.order_key) {
        const { error } = await supa
          .from("sections")
          .update({ title: w.title, order_key: w.order_key })
          .eq("id", w.id).eq("user_id", user.id)
        if (error) throw new Error(`セクション更新に失敗しました: ${error.message}`)
      }
    }
  }

  const toInsert: { user_id: string; material_id: number; order_key: number; title: string }[] = []
  for (const w of wanted) if (!w.id) {
    toInsert.push({ user_id: user.id, material_id: materialId, order_key: w.order_key, title: w.title })
  }
  if (toInsert.length > 0) {
    const { error } = await supa.from("sections").insert(toInsert)
    if (error) throw new Error(`セクション追加に失敗しました: ${error.message}`)
  }

  const toDeleteIds = ex.map(r => r.id).filter(id => !wantedIds.has(id))
  if (toDeleteIds.length > 0) {
    const { error: rErr } = await supa
      .from("section_records")
      .delete()
      .in("section_id", toDeleteIds)
      .eq("user_id", user.id)
    if (rErr) throw new Error(`削除済みセクションの記録削除に失敗しました: ${rErr.message}`)

    const { error } = await supa.from("sections").delete().in("id", toDeleteIds).eq("user_id", user.id)
    if (error) throw new Error(`余剰セクション削除に失敗しました: ${error.message}`)
  }

  const prevActive = (existingPlansRaw ?? []).find(p => p.is_active) ?? null
  const oldRounds = Number(prevActive?.rounds ?? rounds)
  if (rounds < oldRounds) {
    const { data: secsNow } = await supa
      .from("sections")
      .select("id")
      .eq("material_id", materialId).eq("user_id", user.id)
    const secIdsNow = (secsNow ?? []).map(s => s.id)
    if (secIdsNow.length > 0) {
      const { error } = await supa
        .from("section_records")
        .delete()
        .gt("rap_no", rounds)
        .in("section_id", secIdsNow)
        .eq("user_id", user.id)
      if (error) throw new Error(`周回数超過の記録削除に失敗しました: ${error.message}`)
    }
  }

  redirect(`/material/${matCheck.slug}`)
}
