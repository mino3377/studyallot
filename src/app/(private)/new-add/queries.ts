// src/app/(private)/new-add/queries.ts
import "server-only"
import { createClient } from "@/utils/supabase/server"

export type ProjectRow = {
  id: number | string
  name: string
}

export type ProjectOption = {
  id: string
  name: string
}

export async function fetchProjectOptions(userId: string): Promise<ProjectOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((p: ProjectRow) => ({
    id: String(p.id),
    name: p.name,
  }))
}