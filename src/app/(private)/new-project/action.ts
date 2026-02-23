// C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-project\action.ts
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import {
  CreateProjectPayload,
  parseProjectFormData,
} from "@/lib/validators/project"

import { PostgrestError } from "@supabase/supabase-js"
import { makePublicId } from "@/lib/slug"

export async function createProject(fd: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return { ok: false, message: "ログインが必要です。" }

  const raw = parseProjectFormData(fd)

  const parsed = CreateProjectPayload.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "入力値が不正です。必須項目や文字数を確認してください。" }
  }
  const { name, goal, notes } = parsed.data

  const slug = makePublicId("p")

  const payload = {
    user_id: user.id,
    name,
    slug,
    goal: goal || null,
    notes: notes || null,
  }

  const { error } = await supabase
    .from("projects")
    .insert(payload)
    .select("slug")
    .single()

  const isPgError = (e: unknown): e is PostgrestError =>
    typeof e === "object" && e !== null && "code" in e

  if (error) {
    if (isPgError(error) && error.code === "23505") {
      return { ok: false, message: "同じslug（URL用識別子）が既に存在します。名前を少し変えてください。" }
    }
    return { ok: false, message: `作成に失敗しました: ${error.message}` }
  }

  revalidatePath("/project")
  redirect("/project")
}
