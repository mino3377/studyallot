// src/components/settings/settings-sheet-server.tsx
import { createClient } from "@/utils/supabase/server"
import SettingsSheetClient from "./settings-sheet-client"

export default async function SettingsSheetServer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[SettingsSheetServer] user =", user?.id)

  return <SettingsSheetClient user={user} />
}