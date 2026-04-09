// app/(public)/layout.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import studyallot_logo from "@/components/image/studyallot_logo4.svg"
import Image from "next/image"
import AppImage from "@/components/app_image"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="relative min-h-screen bg-[#f5f5f3] text-[#18181b] font-serif">
      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-black/8 bg-white/70 px-3 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
            <Link
              href="/"
              aria-label="StudyAllot ホームへ"
            >
              <AppImage />
            </Link>

            <div className="flex items-center gap-2">
              {user ? (
                <Button
                  asChild
                  size="sm"
                  className="bg-[#18181b] text-white hover:bg-[#25252b]"
                >
                  <Link href="/dashboard">アプリを開く</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-black/10 bg-white/80 text-[#18181b] hover:bg-white"
                >
                  <Link href="/login" className="font-sans">ログイン</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {children}

        <footer className="mt-24 border-t border-black/8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-black/48 md:flex-row md:items-center md:justify-between md:px-6">
            <div>© {new Date().getFullYear()} StudyAllot</div>

            <div className="flex items-center gap-5">
              <Link href="/privacy" className="transition-colors hover:text-black/80">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="transition-colors hover:text-black/80">
                利用規約
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}