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

function toPositiveIntUnder1000(value: unknown, fieldLabel: string) {
  const n = Number(value)
  assert(Number.isInteger(n), `${fieldLabel} は整数で入力してください`)
  assert(n > 0, `${fieldLabel} は1以上にしてください`)
  assert(n < 1000, `${fieldLabel} は1000未満にしてください`)
  return n
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
    assert(Number.isInteger(pid) && pid > 0, "selectedProjectId が不正です")

    const { data: project, error } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("id", pid)
      .single()

    if (error) throw new Error(error.message)
    assert(project, "選択されたプロジェクトが見つかりません")

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

  const unitCount = toPositiveIntUnder1000(input.unitCount, "区切り数")
  const rounds = toPositiveIntUnder1000(input.rounds, "周回数")

  const planDays = Array.isArray(input.planDays) ? input.planDays.map(Number) : []
  assert(planDays.length > 0, "planDays が空です")
  assert(
    planDays.every((n) => Number.isInteger(n) && n >= 0),
    "planDays に不正な値があります"
  )

  const expectedLen = daysBetweenInclusive(startDate, endDate)
  assert(expectedLen > 0, "日付範囲が不正です")
  assert(planDays.length === expectedLen, "planDays の長さが日付範囲と一致しません")

  const totalTasks = unitCount * rounds
  const plannedSum = sum(planDays)
  assert(
    plannedSum === totalTasks,
    "planDays の合計が 総タスク数（セクション数×周回数）と一致しません"
  )

  const actualDays =
    input.actualDays && Array.isArray(input.actualDays) && input.actualDays.length > 0
      ? input.actualDays.map(Number)
      : Array.from({ length: expectedLen }, () => 0)

  assert(actualDays.length === expectedLen, "actualDays の長さが日付範囲と一致しません")
  assert(
    actualDays.every((n) => Number.isInteger(n) && n >= 0),
    "actualDays に不正な値があります"
  )
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

  const { data: proj, error: projErr } = await supabase
    .from("projects")
    .select("slug")
    .eq("user_id", userId)
    .eq("id", projectId)
    .single()

  if (projErr) throw new Error(projErr.message)

  revalidatePath("/project")
  redirect(
    `/project?project=${encodeURIComponent(proj.slug)}&material=${encodeURIComponent(
      matInserted.slug as string
    )}`
  )
}

export async function updateMaterialAction(input: UpdateMaterialInput) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const userId = auth.user.id

  const slug = (input.slug ?? "").trim()
  assert(slug.length > 0, "slug が空です")

  const startDate = toISODate((input.startDate ?? "").trim())
  const endDate = toISODate((input.endDate ?? "").trim())
  assertDateOrder(startDate, endDate)

  const unitType = (input.unitType ?? "").trim()
  assert(unitType.length > 0, "unitType が空です")

  const unitCount = toPositiveIntUnder1000(input.unitCount, "区切り数")
  const rounds = toPositiveIntUnder1000(input.rounds, "周回数")

  const planDays = Array.isArray(input.planDays) ? input.planDays.map(Number) : []
  assert(planDays.length > 0, "planDays が空です")
  assert(
    planDays.every((n) => Number.isInteger(n) && n >= 0),
    "planDays に不正な値があります"
  )

  const expectedLen = daysBetweenInclusive(startDate, endDate)
  assert(expectedLen > 0, "日付範囲が不正です")
  assert(planDays.length === expectedLen, "planDays の長さが日付範囲と一致しません")

  const totalTasks = unitCount * rounds
  assert(sum(planDays) === totalTasks, "planDays の合計が総タスク数と一致しません")

  const { data: existing, error: exErr } = await supabase
    .from("materials")
    .select("start_date, end_date, unit_count, rounds, unit_type")
    .eq("user_id", userId)
    .eq("slug", slug)
    .single()

  if (exErr) throw new Error(exErr.message)
  assert(existing, "教材が見つかりません")

  assert(existing.start_date === startDate, "開始日は編集できません")
  assert(existing.end_date === endDate, "終了日は編集できません")
  assert(Number(existing.unit_count) === unitCount, "区切り数は編集できません")
  assert(Number(existing.rounds) === rounds, "周回数は編集できません")
  assert(String(existing.unit_type) === unitType, "区切りの呼び方は編集できません")

  const projectId = await resolveProjectId({
    supabase,
    userId,
    projectMode: input.projectMode,
    selectedProjectId: input.selectedProjectId,
    newProjectName: input.newProjectName,
  })

  const patch: Record<string, unknown> = {
    project_id: projectId,
    plan_days: planDays,
  }

  const titleTrim = (input.title ?? "").trim()
  if (titleTrim.length > 0) patch.title = titleTrim

  const { error } = await supabase
    .from("materials")
    .update(patch)
    .eq("user_id", userId)
    .eq("slug", slug)

  if (error) throw new Error(error.message)

  const { data: proj, error: projErr } = await supabase
    .from("projects")
    .select("slug")
    .eq("user_id", userId)
    .eq("id", projectId)
    .single()

  if (projErr) throw new Error(projErr.message)

  revalidatePath("/project")
  redirect(`/project?project=${encodeURIComponent(proj.slug)}&material=${encodeURIComponent(slug)}`)
}