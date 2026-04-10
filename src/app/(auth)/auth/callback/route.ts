//C:\Users\chiso\nextjs\study-allot\src\app\(auth)\auth\callback\route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const nextParam = url.searchParams.get("next") ?? "/dashboard"


  if (!code) {
    const errDest = `${url.origin}/login?error=missing_code`
    return NextResponse.redirect(errDest)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const errDest = `${url.origin}/login?error=exchange_failed`
    return NextResponse.redirect(errDest)
  }
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard"

  const dest = `${url.origin}${safeNext}`
  return NextResponse.redirect(dest)
}
