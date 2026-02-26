// app/(private)/(materials)/(material)/material/[slug]/edit/queries.ts
import "server-only"
import { createClient } from "@/utils/supabase/server"

export type SectionRow = { id: number; order_key: number | null; title: string | null }
export type ProjectOption = { id: string; name: string }

export async function getEditMaterialQuery(userId: string, materialSlug: string) {
  const sb = await createClient()

  const { data: mat, error: matErr } = await sb
    .from("materials")
    .select("id, slug, user_id, project_id, title")
    .eq("slug", materialSlug)
    .eq("user_id", userId)
    .maybeSingle()

  if (matErr || !mat) return { ok: false as const, reason: "not-found" as const }

  const mid = mat.id

  const [plansRes, sectionsRes, projectsRes] = await Promise.all([
    sb.from("plans")
      .select("id, total_units, rounds, start_date, end_date, is_active, name")
      .eq("material_id", mid).eq("user_id", userId)
      .order("created_at", { ascending: true }),
    sb.from("sections")
      .select("id, order_key, title")
      .eq("material_id", mid).eq("user_id", userId)
      .order("order_key", { ascending: true }),
    sb.from("projects")
      .select("id, name")
      .eq("user_id", userId)
      .order("name", { ascending: true }),
  ])

  const planRows = plansRes?.data ?? []
  const plans = planRows.map((p) => ({
    id: String(p.id),
    name: p.name ?? "",
    startDate: p.start_date ?? "",
    endDate: p.end_date ?? "",
    rounds: typeof p.rounds === "number" ? p.rounds : "",
    isActive: !!p.is_active,
  }))

  if (!plans.some(p => p.isActive) && plans[0]) plans[0].isActive = true

  const secRows: SectionRow[] = (sectionsRes?.data ?? []).map(s => ({
    id: s.id, order_key: s.order_key, title: s.title,
  }))

  const projects: ProjectOption[] = (projectsRes?.data ?? []).map(p => ({
    id: String(p.id), name: p.name,
  }))

  const sectionIds = secRows.map(s => s.id)
  const sectionTitles = secRows.map(s => s.title ?? `セクション${s.order_key ?? ""}`)

  return {
    ok: true as const,
    material: mat,
    plans,
    sections: secRows,
    sectionIds,
    sectionTitles,
    projects,
  }
}
