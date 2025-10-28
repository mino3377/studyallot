// src/app/(auth)/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const nextParam = url.searchParams.get("next") ?? "/dashboard"

  // ログ
  console.log("[callback] HIT")
  console.log("[callback] origin      =", url.origin)
  console.log("[callback] url         =", url.toString())
  console.log("[callback] code exists =", !!code)
  console.log("[callback] next        =", nextParam)

  // code が無ければエラーへ
  if (!code) {
    const errDest = `${url.origin}/login?error=missing_code`
    console.log("[callback] redirect ->", errDest)
    return NextResponse.redirect(errDest)
  }

  // セッション確立（ここで Supabase の認証 cookie がセットされる）
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  console.log("[callback] exchange error =", error)

  if (error) {
    const errDest = `${url.origin}/login?error=exchange_failed`
    console.log("[callback] redirect ->", errDest)
    return NextResponse.redirect(errDest)
  }

  // ★ open redirect 対策：内部パスのみに限定
  // 例: "/project/abc?tab=1" は許可、"https://evil.com" は拒否
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard"

  const dest = `${url.origin}${safeNext}`
  console.log("[callback] redirect ->", dest)
  return NextResponse.redirect(dest)
}
