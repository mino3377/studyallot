// page-body.tsx
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  BarChart3,
  Target,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Layers,
} from "lucide-react"
import AddButton from "@/components/add-button"

import ProgressRateCard from "@/components/infocards/progress-rate-card"
import CompletionTillTodayCard from "@/components/infocards/ProgressAgainstPlan"
import MaterialsNumCard from "@/components/infocards/materials-num-card"

import { getProjectData } from "./data"

export default async function PageBody({ userId, todayISO }: { userId: string, todayISO: string }) {
  const { projects, summary } = await getProjectData(userId, todayISO)

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">プロジェクト数</div>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              進行中 0 件
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items中心 justify-between">
              <div className="text-sm text-muted-foreground">進捗率（平均）</div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">0%</div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-full relative">
                  <div className="h-2 bg-muted rounded" />
                  <div className="absolute left-0 top-0 h-2 bg-black rounded" style={{ width: `0%` }} />
                </div>
                <span className="text-xs w-12 text-right">0%</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={0} className="h-2 w-full [&>div]:bg-yellow-500" />
                <span className="text-xs w-12 text-right text-yellow-600">0%</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">教材数（合計）</div>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              進行中 0 件
            </div>
          </Card>
        </div>

        <AddButton href={"/new-project"} text={"プロジェクトを追加"} title={"プロジェクト一覧"} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="hidden sm:grid gap-4 grid-cols-3">
        <MaterialsNumCard
          title={"プロジェクト数"}
          totalMaterials={summary.totalProjects}
          activeMaterials={summary.inProgressProjects}
        />
        <ProgressRateCard
          avgActualPct={summary.avgActualPct}
          avgPlannedPct={summary.avgPlannedPct}
        />
        <CompletionTillTodayCard
          actualCellsUntilToday={summary.actualCellsUntilTodayAll}
          plannedCellsUntilToday={summary.plannedCellsUntilTodayAll}
          todayRatePct={summary.todayRatePctAll}
        />
      </div>

      <AddButton href={"/new-project"} text={"プロジェクトを追加"} title={"プロジェクトリスト"} />

      <div className="space-y-3">
        {projects.map((p) => {
          const status =
            p.actualPct > p.plannedPct ? "ahead" : p.actualPct < p.plannedPct ? "behind" : "on"
          void status

          return (
            <Card key={p.id} className="mb-6 p-4 hover:bg-muted/30 transition-colors">
              <div className="gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-xl border bg-card p-2">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <Link
                          href={`/project/${p.slug}`}
                          className="text-base font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-end md:self-start">
                      <Button asChild size="sm" variant="ghost" className="group">
                        <Link href={`/project/${p.slug}`}>
                          <div className="hidden sm:flex">
                            詳細を見る
                          </div>
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {p.period.from} — {p.period.to}
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="inline-flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      {p.daysLeftLabel}
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{`教材 ${p.materialsTotal}`}</span>
                    </div>
                  </div>

                  <ProgressRateCard
                    avgActualPct={p.actualPct}
                    avgPlannedPct={p.plannedPct}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
