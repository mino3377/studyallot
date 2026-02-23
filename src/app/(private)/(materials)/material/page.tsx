// app/(private)/(materials)/material/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { preloadMaterialsData } from "./data"
import MaterialsPageBody from "./page-body"
import { getTodayISOForUser } from "@/lib/user-tz"

export const metadata = {
  title: "Materials | studyallot",
}

export default async function MaterialsAllPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const todayISO = (await getTodayISOForUser(auth.user.id)).todayISO

  preloadMaterialsData(auth.user.id, todayISO)

  return <MaterialsPageBody userId={auth.user.id} />
}
