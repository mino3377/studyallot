// src/lib/user-tz.ts
import "server-only"
import { cache } from "react"
import { createClient } from "@/utils/supabase/server"
import { toLocalISODate } from "@/lib/progress-alloc"

/** ユーザーの固定TZを取得 */
export const getUserTZ = cache(async (userId?: string) => {
  const supabase = await createClient()
  if (!userId) return null

  const { data: row } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", userId)
    .maybeSingle()
  return row?.timezone ?? null
})

/** 今日を YYYY-MM-DD で返す。 */
export async function getTodayISOForUser(userId?: string) {
  const tz = (await getUserTZ(userId)) ?? "UTC"
  const todayISO = toLocalISODate(new Date(), tz)
  return { tz, todayISO } as const
}
