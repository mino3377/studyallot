// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\actions.ts
"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function deleteProjectAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"))
  if (!projectId || Number.isNaN(projectId)) {
    throw new Error("Invalid project id")
  }

  const supa = await createClient()
  const { data: auth } = await supa.auth.getUser()
  if (!auth?.user) redirect("/login")

  const { error } = await supa
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", auth.user.id)

  if (error) throw new Error(error.message)

  redirect("/project")
}