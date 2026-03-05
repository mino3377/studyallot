"use client"

import Image from "next/image"
import Link from "next/link"
import studyallot_logo from "@/components/image/studyallot_logo1.svg"

export default function HeaderClient() {
  return (
    <div className="w-full flex justify-between items-center">
      <Link href={"/project"}>
        <div className="h-16 w-30 justify-center flex items-center gap-3 text-sm font-semibold">
          <div className="bg-white rounded-xs">
            <Image
              src={studyallot_logo}
              alt="StudyAllot"
              className="h-4 w-4 m-1"
              priority
            />
          </div>
          <span>StudyAllot</span>
        </div>
      </Link>
      <div />
    </div>
  )
}