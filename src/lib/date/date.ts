//C:\Users\chiso\nextjs\study-allot\src\lib\date\date.ts

import { format } from "date-fns"

export function iso(d: Date) {
    return format(d, "yyyy-MM-dd")
}

export function parseISODateOnly(s?: string) {
    if (!s) return undefined
    return new Date(`${s}T00:00:00`)
}

export function dateCompare(d1: Date, d2: Date) {
    return d1.getTime() <= d2.getTime()
}

export function weekdayJP(d: Date) {
  const names = ["日", "月", "火", "水", "木", "金", "土"]
  return names[d.getDay()] ?? ""
}