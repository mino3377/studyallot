"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function BackButton({
  fallbackHref = "/",
  children = "←",
}: {
  fallbackHref?: string
  children?: React.ReactNode
}) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="戻る"
      onClick={() => {
        if (window.history.length > 1) router.back()
        else router.push(fallbackHref)
      }}
      className="font-bold text-xl hover:bg-muted m-2"
    >
      {children}
    </Button>
  )
}