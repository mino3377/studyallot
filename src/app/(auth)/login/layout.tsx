// app/(public)/layout.tsx
import Link from "next/link"

import studyallot_logo from "@/components/image/studyallot_logo4.svg"
import Image from "next/image"
import AppImage from "@/components/app_image"

export default async function LoginLayout({ children }: { children: React.ReactNode }) {


  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto max-w-6xl h-12 px-3 flex items-center justify-between">
          <Link
            href={"/"}
            aria-label="StudyAllot ホームへ"
          >
            <AppImage />
          </Link>
        </div>
      </header>

      {children}
    </>
  )
}
