"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const prefersDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches

    const saved = localStorage.getItem("theme-mode")

    const dark =
      saved === "dark" ||
      (!saved && prefersDark)

    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem("theme-mode", next ? "dark" : "light")
    document.documentElement.classList.toggle("dark", next)
  }

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 rounded-xl hover:bg-foreground/5"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}