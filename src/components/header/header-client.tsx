"use client"

import Image from "next/image"
import studyallot_logo from "@/components/image/studyallot_logo1.svg"
import ThemeToggle from "@/components/theme-toggle"

export default function HeaderClient() {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="lg:hidden"></div>

      <div className="flex items-center h-16 w-30 justify-center">
        <Image
          src={studyallot_logo}
          alt="StudyAllot"
          className="h-3 w-auto"
          priority
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  )
}