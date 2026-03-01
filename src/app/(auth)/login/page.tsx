import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MotionDiv } from "@/components/Animate"
import { login, loginDemoUser } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/project")

  const sp = await searchParams
  const next = sp?.next ?? "/project"
  const error = sp?.error

  return (
    <main className="relative min-h-[calc(100dvh)] flex items-center justify-center px-4">
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
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">ログイン</h1>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Google ログイン */}
          <form className="space-y-4">
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
            <details className="group rounded-lg border bg-background/50">
              <summary className="list-none cursor-pointer select-none p-3 text-sm font-medium flex items-center justify-between">
                <span>ゲストログイン</span>
                <span className="text-muted-foreground text-xs group-open:hidden">クリックで開く</span>
                <span className="text-muted-foreground text-xs hidden group-open:inline">クリックで閉じる</span>
              </summary>

              <Separator className="opacity-60" />

              <form className="space-y-3 p-4">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">メールアドレス</label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">パスワード</label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  formAction={loginDemoUser}
                >
                  ゲストアカウントでログイン
                </Button>
              </form>
            </details>
          </div>

          <div className="flex items-center text-sm">
            <Link href="/" className="text-muted-foreground hover:underline">
              ← トップ画面へ戻る
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} StudyAllot
        </p>
      </MotionDiv>
    </main>
  )
}

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
