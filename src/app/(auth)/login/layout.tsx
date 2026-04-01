// app/(public)/layout.tsx
import Link from "next/link"

import studyallot_logo from "@/components/image/studyallot_logo1.svg"
import Image from "next/image"

export default async function LoginLayout({ children }: { children: React.ReactNode }) {


  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto max-w-6xl h-12 px-3 flex items-center justify-between">
          <Link href={"/"}>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="bg-white rounded-xs">
                <Image
                  src={studyallot_logo}
                  alt="StudyAllot"
                  className="h-4 w-4 m-1"
                  aria-label="StudyAllot ホームへ"
                  priority
                />
              </div>

              <span>StudyAllot</span>
            </div>
          </Link>
        </div>
      </header>

      {children}
    </>
  )
}
