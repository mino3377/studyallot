//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\_components\new-add-primary\material-register-step.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { UNIT_TYPE_ITEMS, unitLabel } from "@/lib/type/unit-type"
import type { UnitType } from "@/lib/type/unit-type"
import MaterialSelectToggle from "./select-toggle"

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
  onBack?: () => void
  onOpenDetails?: () => void

  onSave?: () => void
  isSaving?: boolean
  isEdit?: boolean
}

function fmtYYYYMMDD(d?: Date) {
  if (!d) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const da = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${da}`
}

export default function MaterialRegisterStep({
  value,
  onChange,
  restDays,
  onChangeRestDays,
  onBack,
  onOpenDetails,
  onSave,
  isSaving,
  isEdit,
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
  const lock = !!isEdit

  const blockTrigger = lock
    ? {
      onClickCapture: (e: React.MouseEvent) => e.preventDefault(),
      onPointerDown: (e: React.PointerEvent) => e.preventDefault(),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") e.preventDefault()
      },
    }
    : undefined

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-fit min-h-0 overflow-auto">
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
                    <Button
                      variant="outline"
                      className="justify-start gap-2 font-normal"
                      disabled={lock}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {value.startDate ? fmtYYYYMMDD(value.startDate) : ""}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value.startDate}
                      onSelect={(d) => {
                        if (!d) return
                        if (value.endDate && d.getTime() > value.endDate.getTime()) return
                        set({ startDate: d })
                      }}
                      disabled={(date) => {
                        if (lock) return true
                        if (value.endDate && date.getTime() > value.endDate.getTime()) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>終了日</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 font-normal"
                      disabled={lock}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {value.endDate ? fmtYYYYMMDD(value.endDate) : ""}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value.endDate}
                      onSelect={(d) => {
                        if (!d) return
                        if (value.startDate && d.getTime() < value.startDate.getTime()) return
                        set({ endDate: d })
                      }}
                      disabled={(date) => {
                        if (lock) return true
                        if (value.startDate && date.getTime() < value.startDate.getTime()) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>区切りの呼び方</Label>
              <MaterialSelectToggle
                items={[...UNIT_TYPE_ITEMS]}
                selectedId={value.unitType}
                onSelect={(id) => set({ unitType: id as UnitType })}
                triggerHandlers={blockTrigger}
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
                  disabled={lock}
                />
              </div>

              <div className="grid gap-2">
                <Label>周回数</Label>
                <Input
                  type="number"
                  min={1}
                  value={value.laps}
                  onChange={(e) => set({ laps: e.target.value })}
                  disabled={lock}
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
                      disabled={lock}
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ✅ 下側：固定フッター（保存を最下部に貼り付け） */}
      <div className="flex-1 border-t bg-background px-3 py-3">
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="default"
            className="transition-colors"
            onClick={onBack}
          >
            戻る
          </Button>

          <div className="md:hidden">
            <Button
              type="button"
              variant="default"
              className="transition-colors"
              onClick={onOpenDetails}
            >
              詳細設定
            </Button>
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="default"
        className="transition-colors w-full mt-3"
        onClick={() => {
          if (isSaving) return
          onSave?.()
        }}
        disabled={!!isSaving}
        aria-busy={!!isSaving}
      >
        {isSaving ? "保存中..." : "保存"}
      </Button>
    </div>
  )
}