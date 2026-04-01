import React from 'react'
import Image from "next/image"
import studyallot_logo from "@/components/image/studyallot_logo1.svg"


export default function AppImage() {
    return (

        <div className="h-16 w-30 justify-center flex items-center gap-3 text-sm font-semibold">
            <div className="bg-white rounded-xs">
                <Image
                    src={studyallot_logo}
                    alt="StudyAllot"
                    className="h-4 w-4 m-1"
                    priority
                />
            </div >
            <span className="text-white dark:text-black">StudyAllot</span>
        </div>
    )
}
