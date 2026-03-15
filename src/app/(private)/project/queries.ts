// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\queries.ts
import { MaterialRow } from "@/lib/type/material_type"
import { ProjectRow } from "@/lib/type/project_type"
import { createClient } from "@/utils/supabase/server"

export async function fetchProjects(userId: string): Promise<ProjectRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, name, order")
    .eq("user_id", userId)
    .order("order", { ascending: true, nullsFirst: true })
    .order("id", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as ProjectRow[]
}

export async function fetchMaterialsByProjectIds(
  userId: string,
  projectIds: number[]
): Promise<MaterialRow[]> {
  if (projectIds.length === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, title, project_id, slug, start_date, end_date, unit_type, unit_count, rounds, plan_days, actual_days, order"
    )
    .eq("user_id", userId)
    .in("project_id", projectIds)
    .order("project_id", { ascending: true })
    .order("order", { ascending: true })
    .order("id", { ascending: true })



  if (error) throw new Error(error.message)

  return (data ?? []) as MaterialRow[]
}