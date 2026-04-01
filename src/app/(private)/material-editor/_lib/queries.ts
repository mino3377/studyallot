// src/app/(private)/material-editor/queries.ts
import "server-only"
import { createClient } from "@/utils/supabase/server"
import { Project } from "@/lib/type/project_type"



export async function fetchProjectOptions(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, title")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((p: Project) => ({
    id: p.id,
    title: p.title,
  }))
}

export async function fetchSelectedMaterial(userId: string, editSlug: string){
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", editSlug)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return data
}