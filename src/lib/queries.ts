// C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\queries.ts
import { Material } from "@/lib/type/material_type"
import { Project } from "@/lib/type/project_type"
import { createClient } from "@/utils/supabase/server"

export async function fetchProjects(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, order")
    .eq("user_id", userId)
    .order("order", { ascending: true, nullsFirst: false })

  if (error) throw new Error("プロジェクトの取得に失敗しました")

  return (data ?? []) as Project[]
}

export async function fetchMaterials(
  userId: string,
) {

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, title, project_id, slug, start_date, end_date, unit_type, unit_count, rounds, order, task_ratio_row"
    )
    .eq("user_id", userId)
    .order("order", { ascending: true })

  if (error) throw new Error("教材の取得に失敗しました")

  return (data ?? []) as Material[]
}

export async function fetchMaterialsByProjectIds(
  userId: string,
  projectIds: number[]
) {
  if (projectIds.length === 0) return [] as Material[]

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, title, project_id, slug, start_date, end_date, unit_type, unit_count, rounds, order, task_ratio_row"
    )
    .eq("user_id", userId)
    .in("project_id", projectIds)
    .order("order", { ascending: true })

  if (error) throw new Error("教材の取得に失敗しました")

  return (data ?? []) as Material[]
}