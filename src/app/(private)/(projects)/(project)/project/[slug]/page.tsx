// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import ProjectPageBody from "./page-body"
import { preloadProjectData } from "./data"
import { getTodayISOForUser } from "@/lib/user-tz"

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const userId = auth.user.id
  const { todayISO } = await getTodayISOForUser(userId)

  preloadProjectData(userId, params.slug, todayISO)

  return (
    <ProjectPageBody
      slug={params.slug}
      userId={userId}
      todayISO={todayISO}
    />
  )
}
