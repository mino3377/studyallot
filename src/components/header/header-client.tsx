"use client"

import Link from "next/link"
import AppImage from "../app_image"


export default function HeaderClient() {
  return (
    <div className=" items-center">
      <Link href={"/dashboard"}>
        <AppImage />
      </Link>
    </div>
  )
}