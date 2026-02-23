// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\queries.ts
import { createClient } from "@/utils/supabase/server"

export type ProjectRow = { id: number; slug: string; name: string; created_at: string }
export type MaterialRow = { id: number; slug: string; project_id: number; title: string }
export type PlanRow = {
    material_id: number; total_units: number | null; rounds: number | null;
    start_date: string | null; end_date: string | null; is_active: boolean | null; created_at: string; name: string
}
export type SectionRow = { id: number; material_id: number; order_key: number | null }
export type RecordRow = { section_id: number; rap_no: number; recorded_on: string }

export type RawBundle = {
    projectsRaw: ProjectRow[]
    materials: MaterialRow[]
    plans: PlanRow[]
    sections: SectionRow[]
    records: RecordRow[]
}

export async function getAllProjectsVM(userId: string): Promise<RawBundle> {
    const supabase = await createClient()

    const { data: projRows } = await supabase
        .from("projects")
        .select("id, slug, name, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    const projectsRaw: ProjectRow[] = projRows ?? []
    const projectIds = projectsRaw.map(p => p.id)

    if (projectIds.length === 0) {
        return {
            projectsRaw,
            materials: [],
            plans: [],
            sections: [],
            records: [],
        }
    }

    const { data: matRows } = await supabase
        .from("materials")
        .select("id, slug, project_id, title")
        .in("project_id", projectIds)
        .eq("user_id", userId)

    const materials: MaterialRow[] = matRows ?? []
    const materialIds = materials.map(m => m.id)

    if (materialIds.length === 0) {
        return {
            projectsRaw,
            materials,
            plans: [],
            sections: [],
            records: [],
        }
    }

    const [plansRes, sectionsRes] = await Promise.all([
        supabase
            .from("plans")
            .select("material_id, total_units, rounds, start_date, end_date, is_active, created_at,name")
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

    const plans: PlanRow[] = plansRes.data ?? []
    const sections: SectionRow[] = sectionsRes.data ?? []
    const sectionIds = sections.map(s => s.id)

    let records: RecordRow[] = []
    if (sectionIds.length > 0) {
        const recsRes = await supabase
            .from("section_records")
            .select("section_id, rap_no, recorded_on")
            .eq("user_id", userId)
            .in("section_id", sectionIds)

        records = (recsRes.data ?? []) as RecordRow[]
    }

    return {
        projectsRaw,
        materials,
        plans,
        sections,
        records,
    }
}
