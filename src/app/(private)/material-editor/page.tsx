import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import MaterialEditorPageBody from "./page-body"
import type { Material } from "@/lib/type/material_type"
import { fetchProjectOptions, fetchSelectedMaterial } from "./_lib/queries"

export const metadata = { title: "Material Editor | studyallot" }

export default async function MaterialEditorPage({
  searchParams,
}: {
  searchParams?: Promise<{ material?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const params = await searchParams
  const editSlug = params?.material

  const ProjectsRow = await fetchProjectOptions(user.id)

  let selectedMaterial: Material | null = null

  if (editSlug) {
    selectedMaterial = await fetchSelectedMaterial(user.id, editSlug)
  }

  return (
    <MaterialEditorPageBody
      userId={user.id}
      projectsRow={ProjectsRow}
      initialMaterial={selectedMaterial}
      editSlug={editSlug}
    />
  )
}