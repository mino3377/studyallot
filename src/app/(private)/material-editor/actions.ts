//C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\actions.ts

"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { makePublicId } from "@/lib/slug"
import { MaterialSchema } from "@/lib/validators/material"

type ProjectMode = "existing" | "new"

export type SaveNewMaterialInput = {
  projectMode: ProjectMode
  selectedProjectId?: number
  newProjectName?: string

  title: string
  start_date: string
  end_date: string

  unit_type: string
  unit_count: number
  rounds: number

  planDays: number[]
  actualDays?: number[]
}

type UpdateMaterialInput = {
  slug: string
  projectMode: ProjectMode
  selectedProjectId?: number
  newProjectName?: string

  title?: string

  start_date: string
  end_date: string
  unit_type: string
  unit_count: number
  rounds: number
  planDays: number[]
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
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
  selectedProjectId?: number
  newProjectName?: string
}) {
  const { supabase, userId, projectMode } = args

  if (projectMode === "existing") {
    assert(args.selectedProjectId != null, "プロジェクトを選択してください")

    const { data: project, error } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("id", args.selectedProjectId)
      .single()

    if (error) throw new Error(error.message)
    assert(project, "選択されたプロジェクトが見つかりません")

    return args.selectedProjectId
  }

  const name = (args.newProjectName ?? "").trim()
  assert(name, "新しいプロジェクト名を入力してください")

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

function parseMaterial(input: {
  title: string
  start_date: string
  end_date: string
  unit_type: string
  unit_count: number
  rounds: number
}) {
  const parsed = MaterialSchema.safeParse({
    title: (input.title ?? "").trim(),
    start_date: input.start_date ? new Date(input.start_date) : undefined,
    end_date: input.end_date ? new Date(input.end_date) : undefined,
    unit_type: input.unit_type,
    unit_count: input.unit_count,
    rounds: input.rounds,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "入力内容が不正です")
  }

  return {
    title: parsed.data.title,
    start_date: input.start_date,
    end_date: input.end_date,
    unit_type: parsed.data.unit_type,
    unit_count: parsed.data.unit_count,
    rounds: parsed.data.rounds,
  }
}

export async function saveNewMaterialAction(input: SaveNewMaterialInput) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const userId = auth.user.id

  const parsed = parseMaterial({
    title: input.title,
    start_date: input.start_date,
    end_date: input.end_date,
    unit_type: input.unit_type,
    unit_count: input.unit_count,
    rounds: input.rounds,
  })

  const planDays = Array.isArray(input.planDays) ? input.planDays : []
  assert(planDays.length > 0, "planDays が空です")

  const actualDays =
    input.actualDays && input.actualDays.length > 0
      ? input.actualDays
      : Array.from({ length: planDays.length }, () => 0)

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
      title: parsed.title,
      start_date: parsed.start_date,
      end_date: parsed.end_date,
      unit_type: parsed.unit_type,
      unit_count: parsed.unit_count,
      rounds: parsed.rounds,
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

  const parsed = parseMaterial({
    title: input.title ?? "",
    start_date: input.start_date,
    end_date: input.end_date,
    unit_type: input.unit_type,
    unit_count: input.unit_count,
    rounds: input.rounds,
  })

  const planDays = Array.isArray(input.planDays) ? input.planDays : []
  assert(planDays.length > 0, "planDays が空です")

  const { data: existing, error: exErr } = await supabase
    .from("materials")
    .select("start_date, end_date, unit_count, rounds, unit_type")
    .eq("user_id", userId)
    .eq("slug", slug)
    .single()

  if (exErr) throw new Error(exErr.message)
  assert(existing, "教材が見つかりません")

  assert(existing.start_date === parsed.start_date, "開始日は編集できません")
  assert(existing.end_date === parsed.end_date, "終了日は編集できません")
  assert(Number(existing.unit_count) === parsed.unit_count, "区切り数は編集できません")
  assert(Number(existing.rounds) === parsed.rounds, "周回数は編集できません")
  assert(String(existing.unit_type) === parsed.unit_type, "区切りの呼び方は編集できません")

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