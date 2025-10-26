//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\materials-list.tsx

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, CalendarDays, Layers, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// 各教材アイテムでは「進捗バー表示」を統一して ProgressRateCard に任せる
import ProgressRateCard from "@/components/progress-rate-card"

type MaterialVM = {
  id: number | string
  title: string
  type: "book" | "video" | "paper" | "web" | "other"
  startDate: string
  endDate: string
  totalUnits: number
  lapsNow: number
  lapsTotal: number
  plannedPct: number
  actualPct: number
}

function typeJa(t: MaterialVM["type"]) {
  switch (t) {
    case "book": return "書籍"
    case "video": return "動画"
    case "paper": return "資料"
    case "web": return "Web"
    default: return "その他"
  }
}

export default function MaterialsList({
  materials,
  slug,
}: {
  materials: MaterialVM[]
  slug: string
}) {
  if (!materials || materials.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        このプロジェクトにはまだ教材がありません。右上の「教材を追加」から作成してください。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {materials.map((m) => {
        const status =
          m.actualPct > m.plannedPct ? "ahead" : m.actualPct < m.plannedPct ? "behind" : "on"

        return (
          <Card key={m.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="gap-4">
              {/* 左：タイトル + メタ + 進捗 */}
              <div className="space-y-3">


                <div className="flex justify-between">

                  {/* タイトル行 */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-xl border bg-card p-2">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="text-base font-semibold">{m.title}</div>
                    <Badge variant="secondary" className="rounded-full">
                      {typeJa(m.type)}
                    </Badge>
                  </div>

                  {/* 右上：詳細ボタン */}
                  <Button asChild size="sm" variant="ghost" className="group">
                    <Link href={`/material/${m.id}`}>
                      詳細を見る
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>

                </div>



                {/* 期間・総ユニット・周回 */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {m.startDate} — {m.endDate}
                  </span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {m.totalUnits}セクション
                  </span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {m.lapsNow} / {m.lapsTotal} 周
                  </span>
                </div>

                {/* 進捗（上=計画〈黒〉 / 下=実績〈色〉） */}
                <ProgressRateCard avgActualPct={m.actualPct} avgPlannedPct={m.plannedPct} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
