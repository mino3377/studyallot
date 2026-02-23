// app/(private)/(materials)/(material)/material/[slug]/edit/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import EditMaterialPageBody from "./page-body"

export const metadata = { title: "Edit Material | studyallot" }

export default async function EditMaterialPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <EditMaterialPageBody userId={user.id} materialSlug={params.slug} />
}
