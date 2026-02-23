import { Card } from "@/components/ui/card"
import { ProjectSelectButton } from "@/components/project-select-button"
import { getDashboardData } from "./data"
import GanttChart from "./_components/gantt-chart";

export default async function DashboardPageBody(props: { userId: string; projectSlug: string; tz: string; todayISO: string }) {
  const data = await getDashboardData(props.userId, props.projectSlug)

  if (data.materialsCount === 0) {
    return (
      <div className="hidden lg:flex lg:flex-col space-y-4">
        <div className="flex items-center justify-between">
          <ProjectSelectButton projects={data.projects} />
        </div>
        <Card className="w-full overflow-hidden p-8 text-sm text-muted-foreground">
          {data.hitProjectId ? "プロジェクトに教材がありません" : "プロジェクトが見つかりません"}
        </Card>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex lg:flex-col space-y-4">
      <div className="flex items-center justify-between">
        <ProjectSelectButton projects={data.projects} />
      </div>
      <Card className="w-full overflow-hidden p-2">
        <GanttChart
          items={data.items}
          filterProjectSlug={data.filterProjectSlug}
          defaultMode="year"
          todayISO={props.todayISO}
        />
      </Card>
    </div>
  )
}
