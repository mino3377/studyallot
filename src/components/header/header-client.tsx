"use client"

import Image from "next/image"
import studyallot_logo from "@/components/image/studyallot_logo1.svg"
import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link"

export default function HeaderClient() {
  return (
    <div className="w-full flex justify-between items-center">
      <Link href={"/project"}>
        <div className="h-16 w-30 justify-center flex items-center gap-3 text-sm font-semibold hover:opacity-90 transition-opacity">

          <Image
            src={studyallot_logo}
            alt="StudyAllot"
            className="h-2 w-auto"
            priority
          />
          <span>StudyAllot</span>

        </div>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  )
}