// src/app/(private)/project/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import PageBody from "./page-body"

export const metadata = { title: "Project | studyallot" }

export default async function ProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <PageBody userId={user.id} />
}