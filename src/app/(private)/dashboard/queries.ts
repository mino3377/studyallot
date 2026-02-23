import "server-only"
import { createClient } from "@/utils/supabase/server"

export type ProjectLite = { id: number; name: string; slug: string }
export type MaterialRow = { id: number; slug:string; title: string; project_id: number; user_id: string }
export type PlanRow = {
  material_id: number
  total_units: number | null
  rounds: number | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  created_at: string | null
  user_id: string
}

export async function fetchProjects(userId: string): Promise<ProjectLite[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return (data ?? []) as ProjectLite[]
}

export async function fetchMaterials(userId: string, hitProjectId: number | null): Promise<MaterialRow[]> {
  const supabase = await createClient()
  let q = supabase
    .from("materials")
    .select("id, title, slug, project_id, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (hitProjectId) q = q.eq("project_id", hitProjectId)
  const { data } = await q
  return (data ?? []) as MaterialRow[]
}

export async function fetchPlans(userId: string, materialIds: number[]): Promise<PlanRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("plans")
    .select("material_id, total_units, rounds, start_date, end_date, is_active, created_at, user_id")
    .in("material_id", materialIds)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return (data ?? []) as PlanRow[]
}
