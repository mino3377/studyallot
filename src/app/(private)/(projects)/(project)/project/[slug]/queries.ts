// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\queries.ts
import { createClient } from "@/utils/supabase/server"

export type ProjectRow = {
  id: number
  slug: string
  name: string
  goal: string | null
  created_at: string | null
  user_id: string
}

export type MaterialRow = {
  id: number
  slug:string
  title: string
  created_at?: string | null
  user_id?: string
  project_id?: number
}

export type PlanRow = {
  material_id: number
  total_units: number | null
  rounds: number | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  user_id?: string
  created_at?: string | null
}

export type SectionRow = {
  id: number
  material_id: number
  order_key: number | null
}

export type SectionRecordRow = {
  section_id: number
  rap_no: number
  recorded_on: string
}

export const getProjectDetailVM = async (slug: string, userId: string) => {
  const supabase = await createClient()

  const { data: proj, error: projErr } = await supabase
    .from("projects")
    .select("id, slug, name, goal, created_at, user_id")
    .eq("slug", slug)
    .eq("user_id", userId)
    .single<ProjectRow>()

  if (projErr || !proj) return null

  const { data: materialsRaw } = await supabase
    .from("materials")
    .select("id, title, created_at, user_id, project_id,slug")
    .eq("project_id", proj.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const materials = (materialsRaw ?? []) as MaterialRow[]
  const materialIds = materials.map(m => m.id)

  const [plans, sections] = await Promise.all([
    materialIds.length
      ? supabase
          .from("plans")
          .select("material_id, total_units, rounds, start_date, end_date, is_active, user_id, created_at")
          .in("material_id", materialIds)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .then(r => (r.data ?? []) as PlanRow[])
      : Promise.resolve([] as PlanRow[]),

    materialIds.length
      ? supabase
          .from("sections")
          .select("id, material_id, order_key")
          .in("material_id", materialIds)
          .eq("user_id", userId)
          .order("order_key", { ascending: true })
          .then(r => (r.data ?? []) as SectionRow[])
      : Promise.resolve([] as SectionRow[]),
  ])

  const sectionIds = sections.map(s => s.id)
  const records = sectionIds.length
    ? await supabase
        .from("section_records")
        .select("section_id, rap_no, recorded_on")
        .eq("user_id", userId)
        .in("section_id", sectionIds)
        .then(r => (r.data ?? []) as SectionRecordRow[])
    : ([] as SectionRecordRow[])

  return {
    project: proj,
    materials,
    plans,
    sections,
    records,
  }
}

