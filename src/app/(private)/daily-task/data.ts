// src/app/(private)/daily-task/data.ts
import "server-only"
import { cache } from "react"
import { buildWeekBuckets } from "./daily-assignment"
import { fetchMaterialsWithActivePlans, fetchRecordsForWeekByPlans } from "./queries"

export const getDailyTaskData = cache(async (userId: string, weekStartISO: string, tz: string) => {
  const mats = await fetchMaterialsWithActivePlans(userId)
  const week = buildWeekBuckets(
    mats.map((m) => ({
      planId: m.planId,
      materialId: m.materialId,
      materialSlug:m.materialSlug,
      materialTitle: m.materialTitle,
      rounds: m.rounds,
      startISO: m.startISO,
      endISO: m.endISO,
      sections: m.sections,
    })),
    weekStartISO,
    tz
  )

  const weekDates = week.map((d) => d.dateISO)
  const minDate = weekDates[0] ?? null
  const maxDate = weekDates[weekDates.length - 1] ?? null

  const planIds = [...new Set(mats.map((m) => m.planId))]
  const recs = minDate && maxDate ? await fetchRecordsForWeekByPlans(userId, planIds, minDate, maxDate) : []

  const initialChecked: Record<string, boolean> = {}
  for (const day of week) {
    for (const t of day.tasks) {
      const hit =
        recs.findIndex(
          (r) => r.plan_id === t.planId && r.section_id === t.sectionId && r.rap_no === t.rapNo && r.recorded_on === day.dateISO
        ) >= 0
      if (hit) initialChecked[`${day.dateISO}:${t.id}`] = true
    }
  }

  return { week, initialChecked }
})
