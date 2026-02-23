// app/(private)/(materials)/material/page-body.tsx
import { Separator } from "@/components/ui/separator"
import { CalendarDays } from "lucide-react"
import { getMaterialsData } from "./data"
import MaterialsNumCard from "@/components/infocards/materials-num-card"
import ProgressRateCard from "@/components/infocards/progress-rate-card"
import CompletionTillTodayCard from "@/components/infocards/ProgressAgainstPlan"
import AddButton from "@/components/add-button"
import MaterialsList from "./materials-list"
import { getTodayISOForUser } from "@/lib/user-tz"

type Props = { userId: string }

function fmtDateYYYYMMDDSlash(d?: string | undefined | null) {
  if (!d) return "—"
  return d.slice(0, 10).replaceAll("-", "/")
}

export default async function MaterialsPageBody({ userId }: Props) {

  const todayISO = (await getTodayISOForUser(userId)).todayISO
  const { materialsVM, summary } = await getMaterialsData(userId, todayISO)
  console.log("[materialsVM slugs]", materialsVM.map(m => ({ id: m.id, slug: m.slug, title: m.title })))

  const {
    globalMinStart,
    globalMaxEnd,
    totalMaterials,
    activeMaterials,
    avgPlannedPct,
    avgActualPct,
    todayRatePct,
    plannedCellsUntilToday,
    actualCellsUntilToday,
  } = summary

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {fmtDateYYYYMMDDSlash(globalMinStart)} — {fmtDateYYYYMMDDSlash(globalMaxEnd)}
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="hidden sm:grid gap-4 grid-cols-3">
        <MaterialsNumCard
          totalMaterials={totalMaterials}
          activeMaterials={activeMaterials}
        />
        <ProgressRateCard
          avgActualPct={avgActualPct}
          avgPlannedPct={avgPlannedPct}
        />
        <CompletionTillTodayCard
          actualCellsUntilToday={actualCellsUntilToday}
          plannedCellsUntilToday={plannedCellsUntilToday}
          todayRatePct={todayRatePct}
        />
      </div>

      <AddButton href={"/new-material"} text={"教材を追加"} title={"教材リスト"} />

      <MaterialsList materials={materialsVM} />
    </div>
  )
}
