//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\_components\new-add-primary\material-register-step.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import SelectToggle, { type SelectToggleItem } from "../select-toggle"

export type UnitType =
  | "section"
  | "chapter"
  | "page"
  | "unit"
  | "problem"
  | "question"
  | "part"
  | "lesson"

export type MaterialRegisterValue = {
  title: string
  startDate?: Date
  endDate?: Date
  unitType: UnitType
  unitCount: string
  laps: string
}

type Props = {
  value: MaterialRegisterValue
  onChange: (next: MaterialRegisterValue) => void
  restDays: Set<number>
  onChangeRestDays: React.Dispatch<React.SetStateAction<Set<number>>>
  onOpenDetails?: () => void
  onSave?: () => void
}

function fmtYYYYMMDD(d?: Date) {
  if (!d) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const da = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${da}`
}

export function unitLabel(unitType: UnitType) {
  switch (unitType) {
    case "section":
      return "セクション"
    case "chapter":
      return "章"
    case "page":
      return "ページ"
    case "unit":
      return "ユニット"
    case "problem":
      return "問題"
    case "question":
      return "問"
    case "part":
      return "パート"
    case "lesson":
      return "レッスン"
  }
}

const UNIT_ITEMS: SelectToggleItem[] = [
  { id: "section", label: "セクション" },
  { id: "chapter", label: "章" },
  { id: "page", label: "ページ" },
  { id: "unit", label: "ユニット" },
  { id: "problem", label: "問題" },
  { id: "question", label: "問" },
  { id: "part", label: "パート" },
  { id: "lesson", label: "レッスン" },
]

export default function MaterialRegisterStep({
  value,
  onChange,
  restDays,
  onChangeRestDays,
  onOpenDetails,
  onSave,
}: Props) {
  const set = (patch: Partial<MaterialRegisterValue>) => {
    onChange({ ...value, ...patch })
  }

  const toggleRest = (dow: number) => {
    onChangeRestDays((prev) => {
      const next = new Set(prev)
      if (next.has(dow)) next.delete(dow)
      else next.add(dow)
      return next
    })
  }

  const uLabel = unitLabel(value.unitType)

  return (
    <>
      <section className="rounded-xl border bg-background p-3">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>教材名</Label>
            <Input value={value.title} onChange={(e) => set({ title: e.target.value })} />
          </div>

          <div className="grid gap-3 grid-cols-2">
            <div className="grid gap-2">
              <Label>開始日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2 font-normal">
                    <CalendarIcon className="h-4 w-4" />
                    {value.startDate ? fmtYYYYMMDD(value.startDate) : ""}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={value.startDate} onSelect={(d) => set({ startDate: d })} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>終了日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2 font-normal">
                    <CalendarIcon className="h-4 w-4" />
                    {value.endDate ? fmtYYYYMMDD(value.endDate) : ""}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={value.endDate} onSelect={(d) => set({ endDate: d })} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>区切りの呼び方</Label>
            <SelectToggle
              items={UNIT_ITEMS}
              selectedId={value.unitType}
              onSelect={(id) => set({ unitType: id as UnitType })}
            />
          </div>

          <div className="grid gap-3 grid-cols-2">
            <div className="grid gap-2">
              <Label>{uLabel}数</Label>
              <Input
                type="number"
                min={1}
                value={value.unitCount}
                onChange={(e) => set({ unitCount: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>周回数</Label>
              <Input
                type="number"
                min={1}
                value={value.laps}
                onChange={(e) => set({ laps: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>休みの曜日</Label>
            <div className="grid grid-cols-7 gap-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((label, i) => {
                const active = restDays.has(i)
                return (
                  <Button
                    key={i}
                    type="button"
                    variant={active ? "default" : "outline"}
                    className="h-8 px-3 inline-flex"
                    onClick={() => toggleRest(i)}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-between mt-3 px-3">
        <div className="md:hidden flex justify-center">
          <Button
            type="button"
            variant={"secondary"}
            className="h-8 px-6 inline-flex hover:shadow-sm transition-color "
            onClick={onOpenDetails}
          >
            詳細設定
          </Button>
        </div>
        <div className="">
          <Button
            type="button"
            variant={"secondary"}
            className="h-8 px-6 inline-flex hover:shadow-sm transition-color "
            onClick={onSave}
          >
            保存
          </Button>
        </div>
      </div>
    </>
  )
}