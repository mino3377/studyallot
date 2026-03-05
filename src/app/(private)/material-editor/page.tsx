// src/app/(private)/material-editor/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import NewAddPageBody from "./page-body"

export const metadata = { title: "New Material | studyallot" }

export default async function NewAddPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string }> | { edit?: string }
}) {
  const sp = (searchParams instanceof Promise) ? await searchParams : (searchParams ?? {})
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: projectsRaw, error: projectsErr } = await supabase
    .from("projects")
    .select("id,name")
    .eq("user_id", user.id)
    .order("order", { ascending: true })

  if (projectsErr) throw new Error(projectsErr.message)

  const projects = (projectsRaw ?? []).map((p) => ({
    id: String(p.id),
    name: p.name as string,
  }))

  const editSlug = sp.edit?.trim()
  if (!editSlug) {
    return <NewAddPageBody projects={projects} />
  }

  const { data: mat, error: matErr } = await supabase
    .from("materials")
    .select(`
      id,
      slug,
      title,
      start_date,
      end_date,
      unit_type,
      unit_count,
      rounds,
      project_id,
      plan_days
    `)
    .eq("user_id", user.id)
    .eq("slug", editSlug)
    .maybeSingle()

  if (matErr) throw new Error(matErr.message)
  if (!mat) redirect("/project")

  return (
    <NewAddPageBody
      projects={projects}
      initial={{
        editSlug: mat.slug as string,
        projectId: String(mat.project_id),
        title: mat.title as string,
        startDate: mat.start_date as string,
        endDate: mat.end_date as string,
        unitType: mat.unit_type as string,
        unitCount: Number(mat.unit_count),
        laps: Number(mat.rounds),
        planDays: (mat.plan_days as number[]) ?? [],
      }}
    />
  )
}