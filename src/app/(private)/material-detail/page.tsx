import MaterialEditorPageBody from "./page-body"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { fetchSpecificMaterial } from "./_lib/queries"

type Props = {
  searchParams: Promise<{
    material?: string
  }>
}

export default async function Page({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { material: slug } = await searchParams

  const material = slug
    ? await fetchSpecificMaterial(user.id, slug)
    : null

  return <MaterialEditorPageBody material={material} />
}