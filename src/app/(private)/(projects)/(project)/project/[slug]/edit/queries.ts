// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\edit\queries.ts
import { createClient } from "@/utils/supabase/server"

export type ProjectEditRow = {
  id: number
  slug: string
  name: string | null
  goal: string | null
  notes: string | null
  user_id?: string
}

export async function fetchProjectForEdit(slug: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, name, goal, notes")
    .eq("slug", slug)
    .eq("user_id", userId)
    .single<ProjectEditRow>()

  if (error || !data) return null
  return data
}
