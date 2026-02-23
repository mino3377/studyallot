import "server-only"
import { notFound } from "next/navigation"
import EditMaterialClient from "./client"
import { getEditMaterialData, preloadEditMaterial } from "./data"
import { updateMaterialAction } from "./actions"
import { getTodayISOForUser, getUserTZ } from "@/lib/user-tz"
import type { PlanVM } from "@/lib/type/material"

export default async function EditMaterialPageBody({
  userId,
  materialSlug,
}: {
  userId: string
  materialSlug: string
}) {
  preloadEditMaterial(userId, materialSlug)

  const res = await getEditMaterialData(userId, materialSlug)
  if (!res.ok) notFound()

  const { material: mat, plans, sectionIds, sectionTitles, projects } = res
  const { todayISO } = await getTodayISOForUser(userId)

  const toRoundsVM = (v: unknown): number | "" => {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string") {
      const s = v.trim()
      if (s === "") return ""
      if (/^\d+$/.test(s)) return Number(s)
    }
    return ""
  }

  const plansVM: PlanVM[] = (plans ?? []).map((p) => ({
    ...p,
    rounds: toRoundsVM((p as any).rounds),
  }))
  const { timeZone } = await getUserTZ(userId)

  return (
    <EditMaterialClient
      action={async (payload) => {
        "use server"
        await updateMaterialAction(Number(mat.id), payload)
      }}
      projects={projects}
      todayISO={todayISO}
      timeZone={timeZone}
      initial={{
        id: String(mat.id),
        project_id: String(mat.project_id),
        title: mat.title,
        notes: mat.notes ?? "",
        start_date: plansVM[0]?.startDate ?? "",
        end_date: plansVM[0]?.endDate ?? "",
        rounds: typeof plansVM[0]?.rounds === "number" ? plansVM[0].rounds : 1,
        total_units: 0,
        section_titles: sectionTitles,
        section_ids: sectionIds,
        plans: plansVM,
      }}
    />
  )
}
