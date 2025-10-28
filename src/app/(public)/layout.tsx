// app/(public)/layout.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl h-14 px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">StudyAllot</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">特徴</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">使い方</Link>
            <Link href="#screens" className="text-muted-foreground hover:text-foreground">スクリーン</Link>
            <Link href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm"><Link href="/dashboard">アプリを開く</Link></Button>
            ) : (
              <>
                <Button asChild size="sm"><Link href="/login">無料で始める</Link></Button>
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                  <Link href="/login">ログイン</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} StudyAllot</div>
          <div className="flex gap-6">
            <Link href="#features" className="hover:text-foreground">特徴</Link>
            <Link href="#how-it-works" className="hover:text-foreground">使い方</Link>
            <Link href="#screens" className="hover:text-foreground">スクリーン</Link>
            <Link href="#faq" className="hover:text-foreground">FAQ</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
