//C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\_components\primary-panel\material-register-step.tsx

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import {
  UNIT_TYPE_ITEMS,
  unitLabel,
  type unit_type,
} from "@/lib/type/unit-type"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import UnitTypeSelectToggle from "../unit-type-select-toggle"
import {
  MaterialBaseSchema,
  MaterialDateRangeSchema,
} from "@/lib/validators/material"
import { MaterialRegisterValue } from "@/lib/type/material_type"



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
  isPlanManuallyChanged: boolean
  onManualPlanChange?: () => void
  remainingTaskCount: number | null
  saveValidationMessage: string
  onClearSaveValidationMessage?: () => void
}

type FieldErrors = Partial<{
  title: string
  start_date: string
  end_date: string
  unit_type: string
  unit_count: string
  rounds: string
}>

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
  isPlanManuallyChanged,
  onManualPlanChange,
  saveValidationMessage,
  onClearSaveValidationMessage,
}: Props) {
  const uLabel = unitLabel(value.unit_type)
  const lock = !!isEdit
  const saveDisabled = !!isSaving

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingRestDow, setPendingRestDow] = React.useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  const set = (patch: Partial<MaterialRegisterValue>) => {
    onChange({ ...value, ...patch })
  }

  const setFieldError = (key: keyof FieldErrors, message?: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [key]: message ?? "",
    }))
  }

  const validateTitle = (title: string) => {
    const result = MaterialBaseSchema.shape.title.safeParse(title)
    setFieldError("title", result.success ? "" : result.error.issues[0]?.message)
  }

  const validateUnitType = (nextUnitType: unit_type) => {
    const result = MaterialBaseSchema.shape.unit_type.safeParse(nextUnitType)
    setFieldError("unit_type", result.success ? "" : result.error.issues[0]?.message)
  }

  const validateUnitCount = (unit_count: number) => {
    const parsedValue = Number(unit_count)
    const result = MaterialBaseSchema.shape.unit_count.safeParse(parsedValue)
    setFieldError("unit_count", result.success ? "" : result.error.issues[0]?.message)
  }

  const validateRounds = (rounds: number) => {
    const parsedValue = Number(rounds)
    const result = MaterialBaseSchema.shape.rounds.safeParse(parsedValue)
    setFieldError("rounds", result.success ? "" : result.error.issues[0]?.message)
  }

  const validateDateRange = (start_date?: Date, end_date?: Date) => {
    const startResult = MaterialBaseSchema.shape.start_date.safeParse(start_date)
    const endResult = MaterialBaseSchema.shape.end_date.safeParse(end_date)

    setFieldError(
      "start_date",
      startResult.success ? "" : startResult.error.issues[0]?.message
    )

    if (!endResult.success) {
      setFieldError("end_date", endResult.error.issues[0]?.message)
      return
    }

    if (!startResult.success) {
      setFieldError("end_date", "")
      return
    }

    const rangeResult = MaterialDateRangeSchema.safeParse({
      start_date,
      end_date,
    })

    setFieldError(
      "end_date",
      rangeResult.success ? "" : rangeResult.error.issues[0]?.message
    )
  }

  const toggleRest = (dow: number) => {
    onChangeRestDays((prev) => {
      const next = new Set(prev)
      if (next.has(dow)) next.delete(dow)
      else next.add(dow)
      return next
    })
  }

  const handleRestClick = (dow: number) => {
    if (lock) return

    if (isPlanManuallyChanged) {
      setPendingRestDow(dow)
      setConfirmOpen(true)
      return
    }

    toggleRest(dow)
  }

  const handleConfirmRestChange = () => {
    if (pendingRestDow == null) return

    toggleRest(pendingRestDow)
    setPendingRestDow(null)
    setConfirmOpen(false)
    onManualPlanChange?.()
  }

  const handleCancelRestChange = () => {
    setPendingRestDow(null)
    setConfirmOpen(false)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-fit min-h-0 overflow-auto">
        <section className="rounded-xl border bg-background p-3">
          <div className="grid gap-5">
            <div className="text-xs font-bold">
              ※開始日・終了日・セクション数・周回数は後から変更ができません。
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">教材名</Label>
              <Input
                id="title"
                value={value.title}
                onChange={(e) => {
                  const nextTitle = e.target.value
                  set({ title: nextTitle })
                  validateTitle(nextTitle)
                }}
              />
              {fieldErrors.title ? (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              ) : null}
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
                      {value.start_date ? fmtYYYYMMDD(value.start_date) : ""}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value.start_date}
                      onSelect={(d) => {
                        if (!d) return
                        if (value.end_date && d.getTime() > value.end_date.getTime()) return
                        set({ start_date: d })
                        validateDateRange(d, value.end_date)
                      }}
                      disabled={(date) => {
                        if (lock) return true
                        if (value.end_date && date.getTime() > value.end_date.getTime()) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.start_date ? (
                  <p className="text-xs text-destructive">{fieldErrors.start_date}</p>
                ) : null}
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
                      {value.end_date ? fmtYYYYMMDD(value.end_date) : ""}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value.end_date}
                      onSelect={(d) => {
                        if (!d) return
                        if (value.start_date && d.getTime() < value.start_date.getTime()) return
                        set({ end_date: d })
                        validateDateRange(value.start_date, d)
                      }}
                      disabled={(date) => {
                        if (lock) return true
                        if (value.start_date && date.getTime() < value.start_date.getTime()) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.end_date ? (
                  <p className="text-xs text-destructive">{fieldErrors.end_date}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>区切りの呼び方</Label>
              <UnitTypeSelectToggle
                items={UNIT_TYPE_ITEMS}
                selectedId={value.unit_type}
                onSelect={(id) => {
                  const nextUnitType = id as unit_type
                  set({ unit_type: nextUnitType })
                  validateUnitType(nextUnitType)
                }}
                disabled={lock}
              />
              {fieldErrors.unit_type ? (
                <p className="text-xs text-destructive">{fieldErrors.unit_type}</p>
              ) : null}
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="grid gap-2">
                <Label>{uLabel}数</Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  step={1}
                  value={value.unit_count}
                  onChange={(e) => {
                    const nextUnitCount = Number(e.target.value)
                    set({ unit_count: nextUnitCount })
                    validateUnitCount(nextUnitCount)
                  }}
                  disabled={lock}
                />
                {fieldErrors.unit_count ? (
                  <p className="text-xs text-destructive">{fieldErrors.unit_count}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label>周回数</Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  step={1}
                  value={value.rounds}
                  onChange={(e) => {
                    const nextRounds = Number(e.target.value)
                    set({ rounds: nextRounds })
                    validateRounds(nextRounds)
                  }}
                  disabled={lock}
                />
                {fieldErrors.rounds ? (
                  <p className="text-xs text-destructive">{fieldErrors.rounds}</p>
                ) : null}
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
                      onClick={() => handleRestClick(i)}
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

      {saveValidationMessage ? (
        <button
          type="button"
          onClick={onClearSaveValidationMessage}
          className="mt-3 w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-700"
        >
          {saveValidationMessage}
        </button>
      ) : null}

      <Button
        type="button"
        variant="default"
        className="transition-colors w-full mt-3"
        onClick={() => {
          if (saveDisabled) return
          onSave?.()
        }}
        disabled={saveDisabled}
        aria-busy={!!isSaving}
      >
        {isSaving ? "保存中..." : "保存"}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>休みの曜日を変更しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              計画を手動で調整済みです。休みの曜日を変更すると、現在の配分が変わる可能性があります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRestChange}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestChange}>
              変更する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}