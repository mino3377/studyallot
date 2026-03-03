// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\queries.ts
import { createClient } from "@/utils/supabase/server"

export type ProjectRow = {
  id: number
  slug: string
  name: string
  order: number
  created_at: string
}

export type MaterialRow = {
  id: number
  slug: string
  project_id: number
  title: string
  order: number | null // ★追加（NULLあり得るなら null許容）
  start_date: string | null
  end_date: string | null
  unit_type: string | null
  unit_count: number | null
  rounds: number | null
  plan_days: number[] | null
  actual_days: number[] | null
}

export async function fetchProjects(userId: string): Promise<ProjectRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, name, order, created_at")
    .eq("user_id", userId)
    .order("order", { ascending: true })
    .order("id", { ascending: true }) // 保険

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
  "id, slug, project_id, title, order, start_date, end_date, unit_type, unit_count, rounds, plan_days, actual_days"
)
    .eq("user_id", userId)
    .in("project_id", projectIds)
    .order("project_id", { ascending: true }) // ★まずprojectで固める
    .order("order", { ascending: true })      // ★次にorder
    .order("id", { ascending: true })         // ★最後に保険

  if (error) throw new Error(error.message)
  return (data ?? []) as MaterialRow[]
}