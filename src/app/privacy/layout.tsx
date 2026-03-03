// C:\Users\chiso\nextjs\study-allot\src\app\privacy\layout.tsx
import Link from "next/link"

import studyallot_logo from "@/components/image/studyallot_logo1.svg"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"

export default async function PrivacyLayout({ children }: { children: React.ReactNode }) {


  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto max-w-6xl h-14 px-4 md:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
            aria-label="StudyAllot ホームへ"
          >
            <Image
              src={studyallot_logo}
              alt="StudyAllot"
              className="h-2 w-auto"
              priority
            />
            <span>StudyAllot</span>
          </Link>
          <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
        </div>
        
      </header>

      {children}
    </>
  )
}
