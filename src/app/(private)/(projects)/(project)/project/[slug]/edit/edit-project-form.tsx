"use client"

import { useState, FormEvent, useTransition } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PURPOSE_LABEL, type Purpose } from "@/lib/type/project"

type Props = {
  initial: {
    slug: string
    name: string
    purpose: Purpose
    goal: string
    notes: string
    weeklyHours: string
  }
  onSubmit: (fd: FormData) => Promise<{ ok: boolean; message?: string } | void>
}

export default function EditProjectForm({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial.name)
  const [purpose, setPurpose] = useState<Purpose>(initial.purpose)
  const [goal, setGoal] = useState(initial.goal)
  const [notes, setNotes] = useState(initial.notes)
  const [weeklyHours, setWeeklyHours] = useState(initial.weeklyHours)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set("name", name)
    fd.set("purpose", purpose)
    fd.set("goal", goal)
    fd.set("notes", notes)
    fd.set("weeklyHours", weeklyHours)

    startTransition(async () => {
      const res = await onSubmit(fd)
      if (res && "ok" in res && !res.ok) {
        setError(res.message ?? "更新に失敗しました。")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Separator className="mb-6"/>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">プロジェクトの基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">プロジェクト名</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <p className="text-xs text-muted-foreground">ダッシュボードや教材画面に表示される名前です。</p>
            </div>

            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <Select value={purpose} onValueChange={(v) => setPurpose(v as Purpose)}>
                <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PURPOSE_LABEL).map(([k,label])=>(
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">用途に近いものを選択（進捗カードの表示に使います）</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">目標（任意）</Label>
            <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例）TOEIC 800点 など" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weeklyHours">週あたりの想定学習時間（h）</Label>
              <Input
                id="weeklyHours"
                type="number"
                min={0}
                step={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">スケジュール作成時のデフォルトに反映します（後で変更可）</p>
            </div>

            <div className="space-y-2">
              <Label>プレビュー</Label>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary">{name || "プロジェクト名"}</Badge>
                <Badge>{PURPOSE_LABEL[purpose]}</Badge>
                {goal ? <Badge variant="outline">目標: {goal}</Badge> : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">補足（任意）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">メモ</Label>
            <Textarea
              id="notes"
              placeholder="進め方、想定教材、制約条件（平日は1日1h など）"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />
      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost"><Link href={`/project/${initial.slug}`}>キャンセル</Link></Button>
        <Button type="submit" className="px-6" disabled={isPending}>
          {isPending ? "更新中…" : "更新する"}
        </Button>
      </div>
    </form>
  )
}
