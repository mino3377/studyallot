//C:\Users\chiso\nextjs\study-allot\src\server\actions\projects.ts

"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { CreateProjectPayload, UpdateProjectPayload } from "@/lib/validators/project"
import { slugify } from "@/lib/projects/slug"
import { parseWeeklyHours } from "@/lib/projects/hours"

// 新規作成
export async function createProject(fd: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return { ok: false, message: "ログインが必要です。" }

  // FormData -> オブジェクト化
  const raw = {
    name: String(fd.get("name") ?? "").trim(),
    purpose: String(fd.get("purpose") ?? "other"),
    goal: (fd.get("goal") ?? "") as string,
    notes: (fd.get("notes") ?? "") as string,
    weeklyHours: String(fd.get("weeklyHours") ?? "0"),
  }

  const parsed = CreateProjectPayload.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "入力値が不正です。必須項目や数値を確認してください。" }
  }
  const { name, purpose, goal, notes, weeklyHours } = parsed.data

  let slug = slugify(name)
  if (!slug) slug = `p-${Date.now()}`

  type ProjectInsert = {
    user_id: string
    name: string
    slug: string
    category?: string | null
    goal?: string | null
    notes?: string | null
    weekly_hours?: number | null
  }

  const payload: ProjectInsert = {
    user_id: user.id,
    name,
    slug,
    category: purpose,
    goal: goal || null,
    notes: notes || null,
    weekly_hours: weeklyHours ?? null,
  }


  const { error } = await supabase
    .from("projects")
    .insert(payload)
    .select("slug")
    .single()

  if (error) {
    if ((error as any).code === "23505") {
      return { ok: false, message: "同じslug（URL用識別子）が既に存在します。名前を少し変えてください。" }
    }
    return { ok: false, message: `作成に失敗しました: ${error.message}` }
  }

  revalidatePath("/project")
  redirect("/project")
}

// 更新（編集ページから呼ぶ）
// Client から: updateProject({ fd, projectId, slug })
export async function updateProject(args: { fd: FormData; projectId: number; slug: string }) {
  const { fd, projectId, slug } = args

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: "ログインが必要です。" }

  const raw = {
    name: String(fd.get("name") ?? "").trim(),
    purpose: String(fd.get("purpose") ?? "other"),
    goal: (fd.get("goal") ?? "") as string,
    notes: (fd.get("notes") ?? "") as string,
    weeklyHours: (() => {
      const p = parseWeeklyHours(String(fd.get("weeklyHours") ?? ""))
      return p === null ? null : p
    })(),
  }

  const parsed = UpdateProjectPayload.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "入力値が不正です。必須項目や数値を確認してください。" }
  }
  const { name, purpose, goal, notes, weeklyHours } = parsed.data

  const { data: updated, error: updateErr } = await supabase
    .from("projects")
    .update({
      name,
      category: purpose,
      goal,
      notes,
      weekly_hours: weeklyHours,
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("id")
    .single()

  if (updateErr) return { ok: false, message: updateErr.message }
  if (!updated) return { ok: false, message: "対象のプロジェクトが見つからず、更新されませんでした。" }

  revalidatePath(`/project/${slug}`)
  revalidatePath("/project")
  redirect(`/project/${slug}`)
}
