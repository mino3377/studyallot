// app/(private)/(materials)/material/materials-list.tsx

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, CalendarDays, Layers, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProgressRateCard from "@/components/infocards/progress-rate-card"

type MaterialVM = {
  id: number | string
  title: string
  slug: string
  startDate: string
  endDate: string
  totalUnits: number
  lapsNow: number
  lapsTotal: number
  plannedPct: number
  actualPct: number
}

export default function MaterialsList({ materials }: { materials: MaterialVM[] }) {

  return (
    <div className="space-y-3">
      {materials.map((m) => {
        const status =
          m.actualPct > m.plannedPct ? "ahead" : m.actualPct < m.plannedPct ? "behind" : "on"

        return (
          <Card key={String(m.id)} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-xl border bg-card p-2">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="text-base font-semibold">{m.title}</div>
                  </div>

                  <div className="flex justify-end md:self-start">
                    <Button asChild size="sm" variant="ghost" className="group">
                      <Link href={`/material/${m.slug}`}>
                      <div className="hidden sm:flex">詳細を見る</div>
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {m.startDate} — {m.endDate}
                  </span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span className="hidden sm:inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {m.totalUnits}セクション
                  </span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span className="hidden sm:inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {m.lapsNow} / {m.lapsTotal} 周
                  </span>
                </div>

                <ProgressRateCard avgActualPct={m.actualPct} avgPlannedPct={m.plannedPct}></ProgressRateCard>
              </div>

            </div>
          </Card>
        )
      })}
    </div>
  )
}
