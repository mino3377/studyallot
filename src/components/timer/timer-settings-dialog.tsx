"use client"

import { Settings2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  focusMinutes: number
  breakMinutes: number
  totalSets: number
  setFocusMinutes: React.Dispatch<React.SetStateAction<number>>
  setBreakMinutes: React.Dispatch<React.SetStateAction<number>>
  setTotalSets: React.Dispatch<React.SetStateAction<number>>
  disabled: boolean
}

const minuteOptions = Array.from({ length: 12 }, (_, i) => (i + 1) * 5)
const setOptions = Array.from({ length: 12 }, (_, i) => i + 1)

export default function TimerSettingsDialog({
  focusMinutes,
  breakMinutes,
  totalSets,
  setFocusMinutes,
  setBreakMinutes,
  setTotalSets,
  disabled,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="rounded-full border bg-white/50 border-black/10 p-2.5 text-white transition hover:bg-white/30"
          aria-label="タイマー設定"
        >
          <Settings2 className="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>タイマー設定</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-black/65">集中時間</span>
            <Select
              value={String(focusMinutes)}
              onValueChange={(value) => setFocusMinutes(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m}分
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-black/65">休憩時間</span>
            <Select
              value={String(breakMinutes)}
              onValueChange={(value) => setBreakMinutes(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m}分
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-black/65">セット数</span>
            <Select
              value={String(totalSets)}
              onValueChange={(value) => setTotalSets(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}セット
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}