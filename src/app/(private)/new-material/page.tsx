// src/app/(private)/add-textbook/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import NewMaterialClient from "./page-body"
import { createMaterial } from "./action"
import { fetchProjectsForUser } from "./queries"
import { getTodayISOForUser } from "@/lib/user-tz"

export const metadata = {
  title: "Add Textbook | studyallot",
}

export default async function NewMaterialPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const { tz, todayISO } = await getTodayISOForUser(auth.user.id)

  const projects = await fetchProjectsForUser(auth.user.id)

  async function createMaterialAction(input: unknown): Promise<void> {
    "use server"
    await createMaterial(input)
  }

  return (
    <NewMaterialClient
      action={createMaterialAction}
      projects={projects}
      tz={tz}
      todayISO={todayISO}
    />
  )
}
