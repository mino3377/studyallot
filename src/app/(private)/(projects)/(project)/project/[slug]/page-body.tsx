// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\page-body.tsx

import Link from "next/link"
import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import AddButton from "@/components/add-button"
import ProgressRateCard from "@/components/infocards/progress-rate-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  BookOpen,
  CalendarDays as CalendarDaysIcon,
  Layers,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { loadProjectPageData, type MaterialVM } from "./data"

export async function deleteProjectAction(formData: FormData) {
  "use server"
  const projectId = Number(formData.get("projectId"))
  if (!projectId || Number.isNaN(projectId)) {
    throw new Error("Invalid project id")
  }

  const supa = await createClient()
  const { data: auth2 } = await supa.auth.getUser()
  if (!auth2?.user) redirect("/login")

  const { error } = await supa
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", auth2.user.id)

  if (error) throw new Error(error.message)

  redirect("/project")
}

function MaterialsList({ materials }: { materials: MaterialVM[] }) {
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
        const status = m.actualPct > m.plannedPct ? "ahead" : m.actualPct < m.plannedPct ? "behind" : "on"
        void status

        return (
          <Card key={m.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-xl border bg-card p-2">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="text-base font-semibold">{m.title}</div>
                  </div>

                  <Button asChild size="sm" variant="ghost" className="group">
                    <Link href={`/material/${m.slug}`}>
                      詳細を見る
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDaysIcon className="h-3.5 w-3.5" />
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

                <ProgressRateCard avgActualPct={m.actualPct} avgPlannedPct={m.plannedPct} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default async function ProjectPageBody(props: {
  slug: string
  userId: string
  todayISO: string
}) {
  const data = await loadProjectPageData(props.userId, props.slug, props.todayISO)
  if (!data) {
    redirect("/project")
  }

  const { header, materialsVM, stats } = data

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {header.period.from} — {header.period.to}
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{header.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" title="編集">
            <Link href={`/project/${header.slug}/edit`}>
              <Pencil className="h-5 w-5" />
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="削除" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  このプロジェクトを削除すると、関連する教材も削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="projectId" value={String(header.projectId)} />
                  <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700">
                    削除する
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="hidden sm:grid gap-4 grid-cols-3">
        <ProgressRateCard avgActualPct={stats.avgActualPct} avgPlannedPct={stats.avgPlannedPct} />


        <AddButton href={"/new-material"} text={"教材を追加"} />

        <MaterialsList materials={materialsVM} />
      </div>
    </div>
  )
}
