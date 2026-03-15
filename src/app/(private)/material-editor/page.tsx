import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import MaterialEditorPageBody from "./page-body"
import type { MaterialRow, ProjectOption } from "@/lib/type/material_type"
import { fetchProjectOptions, fetchSelectedMaterial } from "./queries"

export const metadata = { title: "Material Editor | studyallot" }

export default async function MaterialEditorPage({
  searchParams,
}: {
  searchParams?: { edit?: string; template?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()


  //ログインしていなければクエリの情報をnextで受け渡して失わないように
  if (!user) {
    const qs = new URLSearchParams()
    if (searchParams?.edit) qs.set("edit", searchParams.edit)
    if (searchParams?.template) qs.set("template", searchParams.template)

    const next = qs.toString()
      ? `/material-editor?${qs.toString()}`
      : "/material-editor"

    redirect(`/login?next=${encodeURIComponent(next)}`)
  }


  //テンプレート、新規モードの場合
  const ProjectsRow = await fetchProjectOptions(user.id)

  const editSlug = searchParams?.edit?.trim()
  if (!editSlug) {
    return <MaterialEditorPageBody projects={ProjectsRow} />
  }

  //編集モードの場合

  const selectedMaterial = await fetchSelectedMaterial(user.id, editSlug)

  if (!selectedMaterial) redirect("/project")

  const initial: MaterialRow & { edit_slug: string } = {
    id: selectedMaterial.id,
    slug: selectedMaterial.slug,
    project_id: selectedMaterial.project_id,
    title: selectedMaterial.title,
    order: selectedMaterial.order,
    start_date: selectedMaterial.start_date,
    end_date: selectedMaterial.end_date,
    unit_type: selectedMaterial.unit_type,
    unit_count: selectedMaterial.unit_count,
    rounds: selectedMaterial.rounds,
    plan_days: selectedMaterial.plan_days,
    actual_days: selectedMaterial.actual_days,
    edit_slug: selectedMaterial.slug,
  }

  return <MaterialEditorPageBody projects={ProjectsRow} initial={initial} />
}