//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\material\queries.ts

import "server-only"
import { createClient } from "@/utils/supabase/server"

export type MaterialRow = {
  id: number
  title: string
  slug:string
}
export type PlanRow = {
  material_id: number
  total_units: number | null
  rounds: number | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  created_at?: string
}
export type SectionRow = { id: number; material_id: number; order_key: number | null }
export type RecordRow = { section_id: number; rap_no: number; recorded_on: string }

export type RawBundle = {
  materials: MaterialRow[]
  plans: PlanRow[]
  sections: SectionRow[]
  records: RecordRow[]
}

export async function getAllMaterialsRaw(userId: string): Promise<RawBundle> {
  const supabase = await createClient()

  const { data: mats } = await supabase
    .from("materials")
    .select("id, title, slug, created_at, user_id, project_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const materials: MaterialRow[] = (mats ?? []) as unknown as MaterialRow[]
  const materialIds = materials.map((m) => m.id)

  if (materialIds.length === 0) {
    return {
      materials: [],
      plans: [],
      sections: [],
      records: [],
    }
  }
  const [{ data: planRows }, { data: secRows }] = await Promise.all([
    supabase
      .from("plans")
      .select("material_id, total_units, rounds, start_date, end_date, is_active, user_id, created_at")
      .in("material_id", materialIds)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sections")
      .select("id, material_id, order_key")
      .in("material_id", materialIds)
      .eq("user_id", userId)
      .order("order_key", { ascending: true }),
  ])

  const plans: PlanRow[] = (planRows ?? []) as unknown as PlanRow[]
  const sections: SectionRow[] = (secRows ?? []) as unknown as SectionRow[]
  const allSectionIds = sections.map((s) => s.id)

  let records: RecordRow[] = []
  if (allSectionIds.length > 0) {
    const { data: recs } = await supabase
      .from("section_records")
      .select("section_id, rap_no, recorded_on")
      .eq("user_id", userId)
      .in("section_id", allSectionIds)

    records = (recs ?? []) as unknown as RecordRow[]
  }

  return {
    materials,
    plans,
    sections,
    records,
  }
}
