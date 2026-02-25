// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import PageBody from "./page-body"
import { preloadProjectData } from "./data"
import { getTodayISOForUser } from "@/lib/user-tz"

export default async function ProjectPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const todayISO = (await getTodayISOForUser(auth.user.id)).todayISO

  preloadProjectData(auth.user.id, todayISO)

  return <PageBody userId={auth.user.id} />
}