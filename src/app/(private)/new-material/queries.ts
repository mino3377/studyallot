// src/app/(private)/add-textbook/queries.ts
import { createClient } from "@/utils/supabase/server"
import type { ProjectOption } from "@/components/new/material/BasicInfoCard"

export async function fetchProjectsForUser(userId: string): Promise<ProjectOption[]> {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", userId)
    .order("name", { ascending: true })

  return (rows ?? []).map(p => ({ id: p.id, name: p.name }))
}
