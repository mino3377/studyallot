// src/app/(auth)/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const next = (formData.get('next') as string) || '/dashboard'
  console.log('[login] next =', next)

  // ★ Next.js 15+: headers() は Promise なので await が必要
  const h = await headers()

  // Vercel/プロキシ下でも現在のオリジンを正しく復元
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host  = h.get('x-forwarded-host')  ?? h.get('host') ?? 'localhost:3000'
  const base  = `${proto}://${host}`

  const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(next)}`
  console.log('[login] base       =', base)
  console.log('[login] redirectTo =', redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (data?.url) {
    try {
      const u = new URL(data.url)
      console.log('[login] authorize host =', u.host)
      console.log('[login] authorize path =', u.pathname + u.search)
    } catch {}
    redirect(data.url)
  }

  console.log('[login] error =', error)
  redirect('/login?error=OAuth%20failed')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) redirect('/error')
  redirect('/login')
}
