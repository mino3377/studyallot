"use client"

import Link from "next/link"
import AppImage from "../app_image"
import CurrentTime from "../current-time"


export default function HeaderClient() {
  return (
    <div className=" items-center">
      <Link href={"/dashboard"}>
        <AppImage />
      </Link>
    </div>
  )
}