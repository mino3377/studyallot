import React from 'react'
import Image from "next/image"
import studyallot_logo from "@/components/image/studyallot_logo4.svg"

type Props = {
    isBlack?:boolean
}

export default function AppImage({isBlack}:Props) {
    return (

        <div className="w-30 justify-center flex items-center gap-3 text-sm font-semibold">
            <div className="">
                <Image
                    src={studyallot_logo}
                    alt="StudyAllot"
                    className="w-7"
                    priority
                />
            </div >
            <span className={`font-serif ${isBlack?"text-white":null}`}>StudyAllot</span>
        </div>
    )
}
