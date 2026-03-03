//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\actions.ts
"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { makePublicId } from "@/lib/slug"
import { assertDateOrder } from "./validation"

type ProjectMode = "existing" | "new"

export type SaveNewMaterialInput = {
  projectMode: ProjectMode
  selectedProjectId?: string
  newProjectName?: string

  title: string
  startDate: string
  endDate: string

  unitType: string
  unitCount: number
  rounds: number

  planDays: number[]
  actualDays?: number[]
}

type UpdateMaterialInput = {
  slug: string
  projectMode: ProjectMode
  selectedProjectId?: string
  newProjectName?: string

  // 旧データ欠損を許容するため optional
  title?: string

  startDate: string
  endDate: string
  unitType: string
  unitCount: number
  rounds: number
  planDays: number[]
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

function toISODate(d: string) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(d), `Invalid date: ${d}`)
  return d
}

function daysBetweenInclusive(startISO: string, endISO: string) {
  const s = new Date(`${startISO}T00:00:00Z`)
  const e = new Date(`${endISO}T00:00:00Z`)
  const diff = Math.floor((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000))
  return diff + 1
}

function sum(arr: number[]) {
  let s = 0
  for (const n of arr) s += n
  return s
}

async function resolveProjectId(args: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  projectMode: ProjectMode
  selectedProjectId?: string
  newProjectName?: string
}) {
  const { supabase, userId, projectMode } = args

  if (projectMode === "existing") {
    const pid = Number((args.selectedProjectId ?? "").trim())
    assert(Number.isFinite(pid) && pid > 0, "selectedProjectId が不正です")
    return pid
  }

  const name = (args.newProjectName ?? "").trim()
  assert(name.length > 0, "newProjectName が空です")

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      slug: makePublicId("p"),
      name,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  return inserted.id as number
}

export async function saveNewMaterialAction(input: SaveNewMaterialInput) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const userId = auth.user.id

  const title = (input.title ?? "").trim()
  assert(title.length > 0, "教材名が空です")

  const startDate = toISODate((input.startDate ?? "").trim())
  const endDate = toISODate((input.endDate ?? "").trim())

  assertDateOrder(startDate, endDate)

  const unitType = (input.unitType ?? "").trim()
  assert(unitType.length > 0, "unitType が空です")

  const unitCount = Number(input.unitCount)
  const rounds = Number(input.rounds)
  assert(Number.isFinite(unitCount) && unitCount > 0, "unitCount が不正です")
  assert(Number.isFinite(rounds) && rounds > 0, "rounds が不正です")

  const planDays = Array.isArray(input.planDays) ? input.planDays.map(Number) : []
  assert(planDays.length > 0, "planDays が空です")
  assert(planDays.every((n) => Number.isFinite(n) && n >= 0), "planDays に不正な値があります")

  const expectedLen = daysBetweenInclusive(startDate, endDate)
  assert(expectedLen > 0, "日付範囲が不正です")
  assert(planDays.length === expectedLen, "planDays の長さが日付範囲と一致しません")

  const totalTasks = unitCount * rounds
  const plannedSum = sum(planDays)
  assert(plannedSum === totalTasks, "planDays の合計が 総タスク数（セクション数×周回数）と一致しません")

  const actualDays =
    input.actualDays && Array.isArray(input.actualDays) && input.actualDays.length > 0
      ? input.actualDays.map(Number)
      : Array.from({ length: expectedLen }, () => 0)

  assert(actualDays.length === expectedLen, "actualDays の長さが日付範囲と一致しません")
  assert(actualDays.every((n) => Number.isFinite(n) && n >= 0), "actualDays に不正な値があります")
  assert(sum(actualDays) <= totalTasks, "actualDays の合計が総タスク数を超えています")

  const projectId = await resolveProjectId({
    supabase,
    userId,
    projectMode: input.projectMode,
    selectedProjectId: input.selectedProjectId,
    newProjectName: input.newProjectName,
  })

  const { data: matInserted, error: matErr } = await supabase
    .from("materials")
    .insert({
      user_id: userId,
      project_id: projectId,
      slug: makePublicId("m"),
      title,
      start_date: startDate,
      end_date: endDate,
      unit_type: unitType,
      unit_count: unitCount,
      rounds,
      plan_days: planDays,
      actual_days: actualDays,
    })
    .select("id, slug, project_id")
    .single()

  if (matErr) throw new Error(matErr.message)

  revalidatePath("/project")

  return {
    projectId: matInserted.project_id as number,
    materialId: matInserted.id as number,
    materialSlug: matInserted.slug as string,
  }
}

export async function updateMaterialAction(input: UpdateMaterialInput) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const userId = auth.user.id

  const slug = (input.slug ?? "").trim()
  assert(slug.length > 0, "slug が空です")

  // ① 入力を先に正規化
  const startDate = toISODate((input.startDate ?? "").trim())
  const endDate = toISODate((input.endDate ?? "").trim())
  assertDateOrder(startDate, endDate)

  const unitType = (input.unitType ?? "").trim()
  assert(unitType.length > 0, "unitType が空です")

  const unitCount = Number(input.unitCount)
  const rounds = Number(input.rounds)
  assert(Number.isFinite(unitCount) && unitCount > 0, "unitCount が不正です")
  assert(Number.isFinite(rounds) && rounds > 0, "rounds が不正です")

  const planDays = Array.isArray(input.planDays) ? input.planDays.map(Number) : []
  assert(planDays.length > 0, "planDays が空です")
  assert(planDays.every((n) => Number.isFinite(n) && n >= 0), "planDays に不正な値があります")

  const expectedLen = daysBetweenInclusive(startDate, endDate)
  assert(expectedLen > 0, "日付範囲が不正です")
  assert(planDays.length === expectedLen, "planDays の長さが日付範囲と一致しません")

  const totalTasks = unitCount * rounds
  assert(sum(planDays) === totalTasks, "planDays の合計が総タスク数と一致しません")

  // ② 編集ロック対象をサーバーで強制するため、DBの既存値を取得
  const { data: existing, error: exErr } = await supabase
    .from("materials")
    .select("start_date, end_date, unit_count, rounds, unit_type")
    .eq("user_id", userId)
    .eq("slug", slug)
    .single()

  if (exErr) throw new Error(exErr.message)
  assert(existing, "教材が見つかりません")

  // ③ 編集不可フィールドの改ざんを拒否（UIロックだけに頼らない）
  assert(existing.start_date === startDate, "開始日は編集できません")
  assert(existing.end_date === endDate, "終了日は編集できません")
  assert(Number(existing.unit_count) === unitCount, "区切り数は編集できません")
  assert(Number(existing.rounds) === rounds, "周回数は編集できません")

  // unitType も編集不可なら縛る（編集可能にしたいならこの1行だけ消す）
  assert(String(existing.unit_type) === unitType, "区切りの呼び方は編集できません")

  // ④ project は変更できる（既存 or 新規）
  const projectId = await resolveProjectId({
    supabase,
    userId,
    projectMode: input.projectMode,
    selectedProjectId: input.selectedProjectId,
    newProjectName: input.newProjectName,
  })

  // ⑤ 更新パッチ：編集可能なものだけを入れる
  // ※上で改ざんチェックしてるので、ロック対象はDB更新しない方が安全
  const patch: Record<string, unknown> = {
    project_id: projectId,
    plan_days: planDays,
  }

  // title は optional：空なら更新しない（旧データ欠損対応）
  const titleTrim = (input.title ?? "").trim()
  if (titleTrim.length > 0) patch.title = titleTrim

  const { error } = await supabase
    .from("materials")
    .update(patch)
    .eq("user_id", userId)
    .eq("slug", slug)

  if (error) throw new Error(error.message)

  revalidatePath("/project")
  return { projectId }
}