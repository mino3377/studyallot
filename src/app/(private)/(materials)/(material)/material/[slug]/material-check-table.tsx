//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[id]\material-check-table.tsx

"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CalendarIcon, Save } from "lucide-react"

type Section = { id: number; order: number; title: string }

type Props = {
  materialId: number
  rounds: number
  sections: Section[]
  initialRecords: Record<string, string>
  todayISO: string
  planId?: number
  saveAction: (fd: FormData) => Promise<void>
}

function ymdLocal(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

export default function MaterialCheckTable({
  rounds,
  sections,
  initialRecords,
  todayISO,
  saveAction,
  planId,
}: Props) {
  const initialRef = React.useRef<Record<string, string>>({ ...initialRecords })

  const [map, setMap] = React.useState<Map<string, string | undefined>>(() => {
    const m = new Map<string, string | undefined>()
    for (const s of sections) {
      for (let r = 1; r <= rounds; r++) {
        const k = `${s.id}:${r}`
        m.set(k, initialRef.current[k])
      }
    }
    return m
  })

  const [changed, setChanged] = React.useState<Set<string>>(new Set())
  const [unsavedChecked, setUnsavedChecked] = React.useState<Set<string>>(new Set())
  const [batchDateISO, setBatchDateISO] = React.useState<string>(todayISO)
  const [open, setOpen] = React.useState(false)
  const [selectDate, setSelectDate] = React.useState<Date | undefined>(undefined)
  const [saving, setSaving] = React.useState(false)
  const [savedBlink, setSavedBlink] = React.useState(false)

  const hasChanges = changed.size > 0
  const hasUnsavedChecked = unsavedChecked.size > 0

  function isSavedKey(k: string) {
    return Boolean(initialRef.current[k])
  }

  function toggleCell(sectionId: number, rapNo: number, next: boolean) {
    const k = `${sectionId}:${rapNo}`

    setMap(prev => {
      const nextMap = new Map(prev)
      if (next) nextMap.set(k, batchDateISO)
      else nextMap.set(k, undefined)
      return nextMap
    })

    setChanged(prev => {
      const n = new Set(prev)
      n.add(k)
      return n
    })

    setUnsavedChecked(prev => {
      const n = new Set(prev)
      if (next) n.add(k)
      else n.delete(k)
      return n
    })
  }

  function confirmRemoveSaved(key: string) {
    const [sid, rap] = key.split(":")
    toggleCell(Number(sid), Number(rap), false)
  }

  function onChangeBatchDate(date: Date | undefined) {
    if (!date) return
    const iso = ymdLocal(date)
    setBatchDateISO(iso)
    setSelectDate(date)
    setMap(prev => {
      const nextMap = new Map(prev)
      for (const k of unsavedChecked) nextMap.set(k, iso)
      return nextMap
    })
    setOpen(false)
  }

  async function handleSave() {
    if (!hasChanges) return
    setSaving(true)
    try {
      const upserts: Array<{ sectionId: number; rapNo: number; recordedOn: string }> = []
      const deletes: Array<{ sectionId: number; rapNo: number }> = []

      for (const [k, v] of map) {
        const [sidStr, rapStr] = k.split(":")
        const sectionId = Number(sidStr)
        const rapNo = Number(rapStr)
        const init = initialRef.current[k]
        if (v && v !== init) upserts.push({ sectionId, rapNo, recordedOn: v })
        else if (!v && init) deletes.push({ sectionId, rapNo })
      }

      const fd = new FormData()
      fd.append("payload", JSON.stringify({ upserts, deletes }))
      if (typeof planId === "number") fd.append("planId", String(planId))

      await saveAction(fd)

      for (const [k, v] of map) {
        if (v) initialRef.current[k] = v
        else delete initialRef.current[k]
      }
      setChanged(new Set())
      setUnsavedChecked(new Set())
      setSavedBlink(true)
      setTimeout(() => setSavedBlink(false), 1200)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存に失敗しました。時間をおいて再実行してください。"
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  const totalCells = sections.length * rounds
  const savedCount = Object.keys(initialRef.current).length

  return (
    <Card className="gap-3 p-2 flex flex-col min-h-0 h-full">
      <div className="shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
          <div className="text-sm font-medium">進捗チェック</div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className={`inline-flex items-center gap-2 ${hasUnsavedChecked ? "" : "opacity-50 pointer-events-none"
                  }`}
                title={hasUnsavedChecked ? "" : "チェックを付けると選択できます"}
              >
                <CalendarIcon className="h-4 w-4" />
                日付を選択（{batchDateISO}）
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectDate} onSelect={onChangeBatchDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className=" my-1 text-xs text-muted-foreground">
          <span className="font-medium">{sections.length} × {rounds}</span>{" "}
          （保存済み <span className="font-medium">{savedCount}</span> / {totalCells}）
        </div>

        <Separator />
      </div>

      {/* ✅ ここが「ポップアップ内スクロール領域」：縦横スクロール */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="border-separate border-spacing-y-0">
          <thead>
            <tr>
              {/* ✅ 左上：X/Y両方固定 */}
              <th
                className="text-left text-xs text-muted-foreground px-1 py-1 w-[160px] md:w-[240px]
                         sticky top-0 left-0 bg-background z-30"
              >
                セクション
              </th>

              {/* ✅ ヘッダー：Y固定（Xはスクロールに追従） */}
              {Array.from({ length: rounds }).map((_, rIdx) => (
                <th
                  key={rIdx}
                  className="text-center text-xs text-muted-foreground px-1 py-1 md:px-2 md:py-1
                           sticky top-0 bg-background z-20"
                >
                  {rIdx + 1} 周目
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sections.map((s) => (
              <tr key={s.order} className="bg-background">
                {/* ✅ セクション列：X/Y固定（常に左に居続ける） */}
                <td className="px-1 py-1 md:px-2 md:py-2 text-sm sticky left-0 bg-background z-10">
                  <div className="w-[100px] md:w-[120px]">
                    <div className="truncate cursor-default" title={s.title}>
                      {s.title}
                    </div>
                    {s.id <= 0 && (
                      <div className="mt-1 text-[10px] text-muted-foreground">(表示のみ・保存不可)</div>
                    )}
                  </div>
                </td>

                {Array.from({ length: rounds }).map((_, rIdx) => {
                  const rapNo = rIdx + 1
                  const key = `${s.id}:${rapNo}`
                  const val = map.get(key)
                  const isChecked = !!val
                  const isToday = val === todayISO
                  const saved = isSavedKey(key)

                  const baseBig =
                    "rounded-sm data-[state=checked]:[&>svg]:block h-5 w-5 md:h-6 md:w-6"
                  const green =
                    " data-[state=checked]:bg-emerald-500 data-[state=checked]:text-emerald-50"
                  const gray =
                    " data-[state=checked]:bg-muted-foreground data-[state=checked]:text-background"

                  return (
                    <td key={rapNo} className="px-1 py-1 md:px-2 md:py-2 text-center align-middle">
                      <div className="flex flex-col items-center">
                        <div className="h-7 md:h-8 flex items-center justify-center">
                          {isChecked ? (
                            saved ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Checkbox
                                    checked
                                    disabled={s.id <= 0}
                                    onCheckedChange={(v) => {
                                      if (v) return
                                    }}
                                    className={baseBig + (isToday ? green : gray)}
                                  />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>チェックを外しますか？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      この項目は保存済みの完了記録です。未チェックに戻します。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        confirmRemoveSaved(key)
                                      }}
                                    >
                                      外す
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Checkbox
                                checked
                                disabled={s.id <= 0}
                                onCheckedChange={(v) => {
                                  if (!v) toggleCell(s.id, rapNo, false)
                                }}
                                className={baseBig + (isToday ? green : gray)}
                              />
                            )
                          ) : (
                            <Checkbox
                              checked={false}
                              disabled={s.id <= 0}
                              onCheckedChange={(v) => {
                                if (v) toggleCell(s.id, rapNo, true)
                              }}
                              className={baseBig}
                            />
                          )}
                        </div>

                        <div className="w-12 md:w-16 h-4 leading-4 text-[10px] text-muted-foreground whitespace-pre">
                          {isChecked ? val : "\u00A0"}
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 下の保存ボタンも固定 */}
      <div className="shrink-0 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-5 w-full md:w-auto ${savedBlink ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : ""
            }`}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </Card>
  )
}
