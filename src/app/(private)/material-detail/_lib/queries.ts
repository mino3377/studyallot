import { Material } from "@/lib/type/material_type"
import { createClient } from "@/utils/supabase/server"

export async function fetchSpecificMaterial(userId: string, slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, title, project_id, slug, start_date, end_date, unit_type, unit_count, rounds, order, task_ratio_row"
    )
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw new Error("データ取得に失敗しました。")
  return (data ?? []) as Material
}