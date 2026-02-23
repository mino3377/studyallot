// src/app/(private)/(projects)/(project)/project/[slug]/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import ProjectPageBody from "./page-body"
import { preloadProjectData } from "./data"
import { getTodayISOForUser } from "@/lib/user-tz"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const { slug } = await params

  const userId = auth.user.id
  const { todayISO } = await getTodayISOForUser(userId)

  preloadProjectData(userId, slug, todayISO)

  return <ProjectPageBody slug={slug} userId={userId} todayISO={todayISO} />
}