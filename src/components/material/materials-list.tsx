//C:\Users\chiso\nextjs\study-allot\src\components\material\materials-list.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Layers, CheckCircle2 } from "lucide-react"
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

type Props = {
  materials: MaterialVM[]
  projectName?: string

  /**
   * ✅ 追加：教材カードが押された時に親へ通知する
   */
  onSelectMaterial?: (m: MaterialVM) => void
}

export default function MaterialsList({ materials, onSelectMaterial }: Props) {
  const hasMaterials = materials.length > 0

  return (
    <div className="space-y-3">
      {!hasMaterials ? (
        <div className="mt-10 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">教材がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => {
            return (
              <div key={String(m.id)} className="space-y-2">
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectMaterial?.(m)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectMaterial?.(m)
                  }}
                  className="mx-0 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="gap-4">
                    <div className="space-y-2">
                      <div className="bg-orange-50 px-3">
                        <span className="-mx-3 text-base font-semibold inline-block rounded-md px-2 py-0.5">
                          {m.title}
                        </span>
                      </div>

                      <div className="mx-3">
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

                        <ProgressRateCard avgActualPct={m.actualPct} avgPlannedPct={m.plannedPct} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}