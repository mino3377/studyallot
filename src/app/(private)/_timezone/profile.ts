// src/app/(private)/_timezone/profile.ts
'use server'
import { createClient } from '@/utils/supabase/server'

export async function captureClientTZOnce(tzFromClient: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok:false }

  const { data: row } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .maybeSingle()

  if (row?.timezone) return { ok:true, wrote:false }

  const { error } = await supabase.from('profiles').upsert(
    { user_id: user.id, timezone: tzFromClient || null, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
  if (error) return { ok:false }
  return { ok:true, wrote:true }
}
