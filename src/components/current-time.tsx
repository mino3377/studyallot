"use client"

import { monthLabel } from "@/lib/constant/period-label"
import React from "react"

export default function CurrentTime() {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setNow(new Date())

    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!now) {
    return <div className="text-white flex gap-3 items-end" />
  }

  const year = now.getFullYear()
  const month = monthLabel[now.getMonth()]
  const date = now.getDate()
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")

  return (
    <div className="text-white flex gap-3 items-end">
      <div className="text-4xl">{`${hour}:${minute}`}</div>
      <div className="text-sm">{`${month} ${date}, ${year}`}</div>
    </div>
  )
}