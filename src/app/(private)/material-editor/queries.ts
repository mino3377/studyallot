// src/app/(private)/material-editor/queries.ts
import "server-only"
import { createClient } from "@/utils/supabase/server"
import { ProjectRow } from "@/lib/type/project_type"
import { MaterialRow } from "@/lib/type/material_type"

export async function fetchProjectOptions(userId: string): Promise<ProjectRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((p: ProjectRow) => ({
    id: p.id,
    name: p.name,
  }))
}

export async function fetchSelectedMaterial(userID: string, editSlug: string): Promise<MaterialRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", userID)
    .eq("slug", editSlug)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return data
}