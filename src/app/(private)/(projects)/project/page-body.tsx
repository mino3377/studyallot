// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\page-body.tsx

import ProjectMaterialsSwitcher from "@/components/projects/project-materials-switcher"
import { loadProjectPageData } from "../(project)/project/[slug]/data"
import { getProjectData } from "./data"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getTodayISOForUser } from "@/lib/user-tz"
import { getDailyTaskData } from "@/app/(private)/daily-task/data"

import { getMaterialData } from "@/app/(private)/(materials)/(material)/material/[slug]/data"

import { saveSectionRecords } from "@/app/(private)/(materials)/(material)/material/[slug]/actions"

function addDaysZoned(baseISO: string, days: number, tz: string): string {
  const d = new Date(`${baseISO}T12:00:00`)
  d.setUTCDate(d.getUTCDate() + days)
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const p = fmt.formatToParts(d)
  const y = p.find((x) => x.type === "year")?.value ?? "1970"
  const m = p.find((x) => x.type === "month")?.value ?? "01"
  const da = p.find((x) => x.type === "day")?.value ?? "01"
  return `${y}-${m}-${da}`
}

function dayOfWeekInTZ(iso: string, tz: string): number {
  const d = new Date(`${iso}T00:00:00`)
  const wd = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tz }).format(d)
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[wd] ?? 0
}

function startOfWeekMondayISO(todayISO: string, tz: string): string {
  const dow = dayOfWeekInTZ(todayISO, tz)
  const offsetFromMon = (dow + 6) % 7
  return addDaysZoned(todayISO, -offsetFromMon, tz)
}

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

type SectionLite = { id: number; order: number; title: string }

type ExpandedMaterialVM = {
  matId: number
  planId: number
  rounds: number
  sections: SectionLite[]
  initialRecords: Record<string, string>
  todayISO: string
}

export default async function PageBody({ userId }: { userId: string }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const { tz, todayISO } = await getTodayISOForUser(auth.user.id)
  const weekStartISO = startOfWeekMondayISO(todayISO, tz)

  const { projects } = await getProjectData(userId, todayISO)

  const entries = await Promise.all(
    projects.map(async (p) => {
      const data = await loadProjectPageData(userId, p.slug, todayISO)
      return [p.slug, (data?.materialsVM ?? []) as MaterialVM[]] as const
    })
  )
  const materialsBySlug: Record<string, MaterialVM[]> = Object.fromEntries(entries)

  const expandedByProjectSlugEntries = await Promise.all(
    projects.map(async (p) => {
      const list = materialsBySlug[p.slug] ?? []

      const expandedPairs = await Promise.all(
        list.map(async (m) => {
          const vm = await getMaterialData(userId, m.slug, todayISO, tz)

          if (!vm) return [m.slug, null] as const

          const planId = vm.plan.id
          if (!planId) return [m.slug, null] as const

          const expanded: ExpandedMaterialVM = {
            matId: vm.mat.id,
            planId,
            rounds: vm.plan.rounds,
            sections: vm.sections,
            initialRecords: vm.initialRecords,
            todayISO: vm.todayISO,
          }

          return [m.slug, expanded] as const
        })
      )

      return [p.slug, Object.fromEntries(expandedPairs)] as const
    })
  )

  const expandedByProjectSlug: Record<string, Record<string, ExpandedMaterialVM | null>> =
    Object.fromEntries(expandedByProjectSlugEntries)

  const dailyTaskDataPromise = getDailyTaskData(userId, weekStartISO, tz)

  async function saveSectionRecordsAction(fd: FormData) {
    "use server"
    await saveSectionRecords(fd)
  }

  return (
    <div className="space-y-6">
      <ProjectMaterialsSwitcher
        projects={projects}
        materialsBySlug={materialsBySlug}
        expandedByProjectSlug={expandedByProjectSlug}
        saveSectionRecordsAction={saveSectionRecordsAction}
        dailyTaskDataPromise={dailyTaskDataPromise}
        todayISO={todayISO}
      />
    </div>
  )
}