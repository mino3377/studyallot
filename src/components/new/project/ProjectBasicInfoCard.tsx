//C:\Users\chiso\nextjs\study-allot\src\components\projects\ProjectBasicInfoCard.tsx

"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function ProjectBasicInfoCard({
  name, onChangeName,
  goal, onChangeGoal,
}: {
  name: string; onChangeName: (v: string) => void
  goal: string; onChangeGoal: (v: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">基本情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 mb-2">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">プロジェクト名</Label>
          <Input id="name" value={name} onChange={(e) => onChangeName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">目標（任意）</Label>
          <Input
            id="goal"
            placeholder=""
            value={goal}
            onChange={(e) => onChangeGoal(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
