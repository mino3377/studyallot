//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\edit\action.ts

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import {
  UpdateProjectPayload,
  parseProjectFormData,
} from "@/lib/validators/project"

export async function updateProject({
  fd,
  projectId,
  slug,
}: {
  fd: FormData
  projectId: number
  slug: string
}): Promise<{ ok: boolean; message?: string }> {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return { ok: false, message: "Not authenticated." }

  const raw = parseProjectFormData(fd)

  const parsed = UpdateProjectPayload.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "入力値が不正です。必須項目や文字数を確認してください。" }
  }
  const { name, goal, notes } = parsed.data

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      goal: goal || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", auth.user.id)

  if (error) return { ok: false, message: error.message }

  revalidatePath(`/project/${slug}`)
  revalidatePath(`/project/${slug}/edit`)

  redirect(`/project/${slug}`)
}
