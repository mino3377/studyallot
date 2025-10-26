//C:\Users\chiso\nextjs\study-allot\src\app\(auth)\login\actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 環境に応じてベースURLを切り替える（本番/プレビュー/ローカル対応）
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        }/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    redirect('/error')
  }
  redirect('/login')
}