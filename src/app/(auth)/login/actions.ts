'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

/** Google OAuth ログイン */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const next = (formData.get('next') as string) || '/daily-task'
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host  = h.get('x-forwarded-host')  ?? h.get('host') ?? 'localhost:3000'
  const base  = `${proto}://${host}`
  const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(next)}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent('Googleログインに失敗しました'))
  }
  if (data?.url) redirect(data.url)

  redirect('/login?error=OAuth%20failed')
}

export async function loginDemoUser(formData: FormData) {
  const supabase = await createClient()

  const next = (formData.get('next') as string) || '/daily-task'
  const email = (formData.get('email') as string | null)?.trim()
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('メールアドレスとパスワードを入力してください'))
  }

  const { error, data } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/login?error=' + encodeURIComponent('メール/パスワードが正しくありません'))
  }

  redirect(next)
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) redirect('/error')
  redirect('/login')
}
