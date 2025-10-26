"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ProjectNotesCard({
  notes, onChangeNotes,
}: { notes: string; onChangeNotes: (v: string)=>void }) {
  return (
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
            onChange={(e)=>onChangeNotes(e.target.value)}
            rows={5}
          />
        </div>
      </CardContent>
    </Card>
  )
}
