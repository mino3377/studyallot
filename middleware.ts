//C:\Users\chiso\nextjs\study-allot\middleware.ts

import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/app/:path*",   // アプリ内はログイン必須
    "/login",        // 認証ページ
    // "/auth/:path*",  // OAuthコールバックなど
  ],
}
