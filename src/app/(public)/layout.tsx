// app/(public)/layout.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import studyallot_logo from "@/components/image/studyallot_logo1.svg"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-6xl h-14 px-4 md:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            aria-label="StudyAllot ホームへ"
          >
            <Image
              src={studyallot_logo}
              alt="StudyAllot"
              className="h-4 w-4"
              priority
            />
            <span>StudyAllot</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link href="/project">アプリを開く</Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                variant="outline"
                
              >
                <Link href="/login">ログイン</Link>
              </Button>
            )}
            <ThemeToggle />

            
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t mt-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} StudyAllot</div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              利用規約
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
