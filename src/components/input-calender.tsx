// components/input-calender.tsx
"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function ymd(date: Date) {
  const y = String(date.getFullYear())
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
function formatHuman(date?: Date) {
  if (!date) return ""
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
}
function parseISO(iso?: string) {
  return iso ? new Date(iso + "T00:00:00") : undefined
}
function clampDate(d: Date, min?: Date, max?: Date) {
  if (min && d < min) return min
  if (max && d > max) return max
  return d
}

type Calendar29Props = {
  id: string
  label: string
  /** ISO 形式 "YYYY-MM-DD"（親から受け取る） */
  value: string
  /** カレンダー/自然言語の入力が確定したら ISO を親に返す */
  onChange: (iso: string) => void
  placeholder?: string
  /** 選択可能最小/最大（ISO） */
  minISO?: string
  maxISO?: string
}

export function Calendar29({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  minISO,
  maxISO,
}: Calendar29Props) {
  const [open, setOpen] = React.useState(false)

  const minD = React.useMemo(() => parseISO(minISO), [minISO])
  const maxD = React.useMemo(() => parseISO(maxISO), [maxISO])

  // 内部状態
  const isoToDate = React.useMemo(() => parseISO(value), [value])
  const [text, setText] = React.useState<string>(value ? formatHuman(isoToDate) : "")
  const [date, setDate] = React.useState<Date | undefined>(isoToDate)
  const [month, setMonth] = React.useState<Date | undefined>(isoToDate ?? minD)

  // 親の value が変わったら同期
  React.useEffect(() => {
    const d = parseISO(value)
    setDate(d)
    setMonth(d ?? minD)
    setText(d ? formatHuman(d) : "")
  }, [value, minD])

  // 範囲外を選べないよう react-day-picker に制約を渡す
  const disabled = React.useCallback(
    (d: Date) => {
      if (minD && d < minD) return true
      if (maxD && d > maxD) return true
      return false
    },
    [minD, maxD]
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
            const v = e.target.value
            setText(v)
            const parsed = parseDate(v)
            if (parsed) {
              const clamped = clampDate(parsed, minD, maxD)
              setDate(clamped)
              setMonth(clamped)
              onChange(ymd(clamped)) // 親へ ISO を返す
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
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={(m) => {
                // 月移動も範囲内に制限
                if (minD && m < new Date(minD.getFullYear(), minD.getMonth(), 1)) {
                  setMonth(new Date(minD.getFullYear(), minD.getMonth(), 1))
                } else if (maxD && m > new Date(maxD.getFullYear(), maxD.getMonth(), 1)) {
                  setMonth(new Date(maxD.getFullYear(), maxD.getMonth(), 1))
                } else {
                  setMonth(m)
                }
              }}
              onSelect={(d) => {
                if (!d) return
                if (disabled(d)) return // 範囲外は無効
                const clamped = clampDate(d, minD, maxD)
                setDate(clamped)
                setText(formatHuman(clamped))
                onChange(ymd(clamped))   // 親へ ISO を返す
                setOpen(false)
              }}
              fromDate={minD}    // react-day-picker: 最小
              toDate={maxD}      // react-day-picker: 最大
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
