import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import DashboardPageBody from "./page-body"
import { preloadDashboardData } from "./data"
import { getTodayISOForUser } from "@/lib/user-tz"

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ project?: string }>}) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const sp = await searchParams
  const projectSlug = sp.project && sp.project !== "all" ? sp.project : "all"

  const { tz, todayISO } = await getTodayISOForUser(auth.user.id)

  preloadDashboardData(auth.user.id, projectSlug)

  return <DashboardPageBody userId={auth.user.id} projectSlug={projectSlug} tz={tz} todayISO={todayISO} />
}
