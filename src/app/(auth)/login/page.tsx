// src/app/(auth)/login/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MotionDiv } from "@/components/Animate"
import { Sparkles } from "lucide-react"
import { login } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  // ★ Promise を受け取り、後で await します
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // すでにログイン済みならダッシュボードへ
  if (user) redirect("/dashboard")

  // ★ ここで await
  const sp = await searchParams
  const next = sp?.next ?? "/dashboard"
  const error = sp?.error

  return (
    <main className="relative min-h-[calc(100dvh)] flex items-center justify-center px-4">
      {/* 背景の柔らかいグラデ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(800px 400px at 50% -10%, hsl(var(--primary)/.20), transparent 60%), radial-gradient(600px 300px at 20% 10%, hsl(var(--muted-foreground)/.20), transparent 60%)",
        }}
      />

      <MotionDiv className="w-full max-w-md">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl p-6 md:p-8 space-y-6">
          {/* ロゴ / タイトル */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              <span>StudyAllot</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ログイン</h1>
            <p className="text-sm text-muted-foreground">
              学習を続けるための「今日のタスク」にすぐアクセス。
            </p>
          </div>

          {/* エラー表示（あれば） */}
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Google でログイン */}
          <form className="space-y-4">
            {/* next パラメータ（戻り先） */}
            <input type="hidden" name="next" value={next} />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              variant="default"
              formAction={login}
            >
              <GoogleIcon className="mr-2 size-4" />
              Googleでログイン
            </Button>
          </form>

          <div className="space-y-4">
            <Separator />
            <div className="text-xs text-muted-foreground leading-relaxed">
              ログインにより{" "}
              <Link href="/terms" className="underline underline-offset-2">
                利用規約
              </Link>{" "}
              と{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                プライバシーポリシー
              </Link>{" "}
              に同意したものとみなされます。
            </div>
          </div>

          {/* 補助ナビ */}
          <div className="flex items-center justify-between text-sm">
            <Link href="/" className="text-muted-foreground hover:underline">
              ← トップへ戻る
            </Link>
            <Link href="/signup" className="text-muted-foreground hover:underline">
              新規登録はこちら
            </Link>
          </div>
        </div>

        {/* フッターメタ */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} StudyAllot
        </p>
      </MotionDiv>
    </main>
  )
}

/* --- Googleアイコン（軽量SVG） --- */
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" aria-hidden="true" {...props}>
      <path fill="#4285f4" d="M533.5 278.4c0-18.6-1.7-37-5.1-54.9H272v103.9h147.3c-6.3 34.1-25.1 63-53.5 82.4v68.3h86.5c50.6-46.6 80.2-115.3 80.2-199.7z" />
      <path fill="#34a853" d="M272 544.3c72.5 0 133.4-24 177.8-65.1l-86.5-68.3c-24 16.1-54.7 25.7-91.3 25.7-70 0-129.3-47.3-150.6-110.9H32.8v69.6C76.8 487.4 168.6 544.3 272 544.3z" />
      <path fill="#fbbc04" d="M121.4 325.7c-10.1-30.1-10.1-62.6 0-92.7v-69.6H32.8C-10.9 213.6-10.9 330.7 32.8 417.8l88.6-92.1z" />
      <path fill="#ea4335" d="M272 106.1c39.4-.6 77.2 14.1 106 41.4l79.1-79.1C412.2 24 343.8-1.4 272 0 168.6 0 76.8 56.9 32.8 156.7l88.6 92.1C142.7 153.4 202 106.1 272 106.1z" />
    </svg>
  )
}
