//C:\Users\chiso\nextjs\study-allot\src\components\input-calender.tsx
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function isISODate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v)
}
function formatHumanInTZ(iso: string | undefined, timeZone: string) {
  if (!iso) return ""
  const d = new Date(iso + "T00:00:00")
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone, year: "numeric", month: "long", day: "numeric", weekday: "short",
  }).format(d)
}
function ymdInTZ(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date)
  const y = parts.find(p => p.type === "year")?.value ?? "0000"
  const m = parts.find(p => p.type === "month")?.value ?? "01"
  const d = parts.find(p => p.type === "day")?.value ?? "01"
  return `${y}-${m}-${d}`
}
function cmpISO(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0
}
function isoToDate(iso?: string) {
  return iso ? new Date(iso + "T00:00:00") : undefined
}
function getYearFromISO(iso?: string) {
  return iso ? Number(iso.slice(0, 4)) : undefined
}
function monthBoundary(iso?: string, which: "start" | "end" = "start") {
  if (!iso) return undefined
  const y = Number(iso.slice(0, 4))
  const m = Number(iso.slice(5, 7))
  return which === "start" ? new Date(y, m - 1, 1) : new Date(y, m, 0)
}

type Calendar29Props = {
  timeZone: string
  id: string
  label: string
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  minISO?: string
  maxISO?: string
}

export function Calendar29({
  timeZone,
  id,
  label,
  value,
  onChange,
  placeholder = "",
  minISO,
  maxISO,
}: Calendar29Props) {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState<string>(formatHumanInTZ(value, timeZone))
  const [month, setMonth] = React.useState<Date | undefined>(isoToDate(value) ?? isoToDate(minISO))

  const fromDate = isoToDate(minISO)
  const toDate = isoToDate(maxISO)
  const fromYear = getYearFromISO(minISO)
  const toYear = getYearFromISO(maxISO)
  const fromMonth = monthBoundary(minISO, "start")
  const toMonth = monthBoundary(maxISO, "start")

  React.useEffect(() => {
    setText(formatHumanInTZ(value, timeZone))
    if (value) setMonth(isoToDate(value))
  }, [value, timeZone])

  const disabled = React.useCallback(
    (d: Date) => {
      const iso = ymdInTZ(d, timeZone)
      if (minISO && cmpISO(iso, minISO) < 0) return true
      if (maxISO && cmpISO(iso, maxISO) > 0) return true
      return false
    },
    [timeZone, minISO, maxISO]
  )

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="px-1">{label}</Label>

      <div className="relative flex gap-2">
        <Input
          id={id}
          value={text}
          placeholder={placeholder}
          className="bg-background pr-10"
          onChange={(e) => {
            const raw = e.target.value.trim()
            setText(raw)
            if (isISODate(raw)) {
              const iso = raw
              const clamped =
                (minISO && cmpISO(iso, minISO) < 0) ? minISO :
                (maxISO && cmpISO(iso, maxISO) > 0) ? maxISO : iso
              onChange(clamped)
              setText(formatHumanInTZ(clamped, timeZone))
              setMonth(isoToDate(clamped))
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={isoToDate(value)}
              captionLayout="dropdown"
              month={month}
              onMonthChange={(m) => setMonth(m)}
              onSelect={(d) => {
                if (!d) return
                if (disabled(d)) return
                const iso = ymdInTZ(d, timeZone)
                onChange(iso)
                setText(formatHumanInTZ(iso, timeZone))
                setMonth(isoToDate(iso))
                setOpen(false)
              }}
              fromDate={fromDate}
              toDate={toDate}
              fromYear={fromYear}
              toYear={toYear}
              fromMonth={fromMonth}
              toMonth={toMonth}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
