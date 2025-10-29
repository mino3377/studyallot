// src/app/(auth)/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const next = (formData.get('next') as string) || '/dashboard'

  const h = await headers()

  // Vercel/プロキシ下でも現在のオリジンを正しく復元
  //http://localhost:3000/login
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host  = h.get('x-forwarded-host')  ?? h.get('host') ?? 'localhost:3000'
  const base  = `${proto}://${host}`

  const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(next)}`

  console.log("redirectTo" , redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (data?.url) {
    try {
      const u = new URL(data.url)
    } catch {}
    redirect(data.url)
  }

  redirect('/login?error=OAuth%20failed')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) redirect('/error')
  redirect('/login')
}
