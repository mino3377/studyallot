"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PURPOSE_LABEL, type Purpose } from "@/lib/type/project"

export default function ProjectBasicInfoCard({
  name, onChangeName,
  purpose, onChangePurpose,
  goal, onChangeGoal,
}: {
  name: string; onChangeName: (v: string) => void 
  purpose: Purpose; onChangePurpose: (p: Purpose) => void
  goal: string; onChangeGoal: (v: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">プロジェクトの基本情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">プロジェクト名</Label>
            <Input id="name" value={name} onChange={(e)=>onChangeName(e.target.value)} required />
            <p className="text-xs text-muted-foreground">ダッシュボードや教材画面に表示される名前です。</p>
          </div>

          <div className="space-y-2">
            <Label>カテゴリ</Label>
            <Select value={purpose} onValueChange={(v)=>onChangePurpose(v as Purpose)}>
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
          <Input
            id="goal"
            placeholder="例）TOEIC 800点突破、数学テストで＋15点 など"
            value={goal}
            onChange={(e)=>onChangeGoal(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
