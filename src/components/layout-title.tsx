"use client"

import { usePathname } from "next/navigation"

export default function LayoutTitle() {
  const pathname = usePathname()

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/material-detail": "Detail",
    "/material-editor": "Editor",
    "/order": "Order",
    "/overview": "Overview",
    "/statistics": "Statistics",
  }

  const title = titleMap[pathname] ?? ""

  return <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
}