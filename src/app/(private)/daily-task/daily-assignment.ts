// C:\Users\chiso\nextjs\study-allot\src\app\(private)\daily-task\daily-assignment.ts
export type SectionLite = {
  id: number
  order: number
  title: string
  materialId?: number
}

export type DailyTask = {
  id: string
  planId: number
  materialId: number
  materialSlug: string;
  material: string
  unitLabel: string
  sectionId: number
  rapNo: number
}

export type DayBucket = {
  dateISO: string
  tasks: DailyTask[]
}

export function toZonedISODate(d: Date, tz: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
  const p = fmt.formatToParts(d)
  const y = p.find((x) => x.type === "year")?.value ?? "1970"
  const m = p.find((x) => x.type === "month")?.value ?? "01"
  const dd = p.find((x) => x.type === "day")?.value ?? "01"
  return `${y}-${m}-${dd}`
}

export function addDaysZoned(baseISO: string, days: number, tz: string): string {
  const d = new Date(`${baseISO}T12:00:00`)
  d.setUTCDate(d.getUTCDate() + days)
  return toZonedISODate(d, tz)
}

export function diffDaysInclusive(startISO: string, endISO: string, tz: string): number {
  const s = new Date(`${startISO}T12:00:00`)
  const e = new Date(`${endISO}T12:00:00`)
  const ms = e.getTime() - s.getTime()
  const raw = Math.floor(ms / 86400000)
  return raw + 1
}

export function enumerateDatesInclusive(startISO: string, endISO: string, tz: string): string[] {
  const days = diffDaysInclusive(startISO, endISO, tz)
  return Array.from({ length: Math.max(0, days) }, (_, i) => addDaysZoned(startISO, i, tz))
}

export function distributeCellsPerDay(totalCells: number, totalDays: number): number[] {
  if (totalDays <= 0) return []
  const base = Math.floor(totalCells / totalDays)
  const rem = totalCells % totalDays
  return Array.from({ length: totalDays }, (_, i) => base + (i < rem ? 1 : 0))
}

export function cellIndexToRoundSection(cellIndex: number, sectionsCount: number): { roundNo: number; sectionIndex: number } {
  const roundNo = Math.floor(cellIndex / sectionsCount) + 1
  const sectionIndex = cellIndex % sectionsCount
  return { roundNo, sectionIndex }
}

export function assignmentForDate(
  sections: SectionLite[],
  rounds: number,
  startISO: string,
  endISO: string,
  dateISO: string,
  tz: string
): { title: string; round: number; sectionId: number }[] {
  const totalSections = sections.length
  const totalCells = totalSections * Math.max(1, rounds)
  if (totalSections === 0 || totalCells === 0) return []
  const days = diffDaysInclusive(startISO, endISO, tz)
  if (days <= 0) return []
  const perDay = distributeCellsPerDay(totalCells, days)
  const allDays = enumerateDatesInclusive(startISO, endISO, tz)
  const dayIndex = allDays.indexOf(dateISO)
  if (dayIndex < 0) return []
  const startCell = perDay.slice(0, dayIndex).reduce((a, b) => a + b, 0)
  const count = perDay[dayIndex]
  const endCell = startCell + count
  const out: { title: string; round: number; sectionId: number }[] = []
  for (let c = startCell; c < endCell; c++) {
    const { roundNo, sectionIndex } = cellIndexToRoundSection(c, totalSections)
    const sec = sections[sectionIndex]
    out.push({ title: sec.title, round: roundNo, sectionId: sec.id })
  }
  return out
}

export type MaterialPlanInput = {
  planId: number
  materialId: number
  materialSlug: string;
  materialTitle: string
  rounds: number
  startISO: string
  endISO: string
  sections: SectionLite[]
}

export function buildWeekBuckets(inputs: MaterialPlanInput[], weekStartISO: string, tz: string): DayBucket[] {
  const days = Array.from({ length: 7 }, (_, i) => addDaysZoned(weekStartISO, i, tz))
  const buckets: DayBucket[] = days.map((d) => ({ dateISO: d, tasks: [] }))
  for (const m of inputs) {
    if (!m.sections?.length || m.rounds <= 0) continue
    for (let i = 0; i < 7; i++) {
      const dayISO = buckets[i].dateISO
      if (dayISO < m.startISO || dayISO > m.endISO) continue
      const assigns = assignmentForDate(m.sections, m.rounds, m.startISO, m.endISO, dayISO, tz)
      for (const a of assigns) {
        const task: DailyTask = {
          id: `${dayISO}:${m.materialId}:${a.sectionId}:${a.round}`,
          planId: m.planId,
          materialId: m.materialId,
          materialSlug: m.materialSlug,
          material: m.materialTitle,
          unitLabel: `${a.title}（${a.round}周目）`,
          sectionId: a.sectionId,
          rapNo: a.round,
        }
        buckets[i].tasks.push(task)
      }
    }
  }
  for (const b of buckets) {
    b.tasks.sort((x, y) => {
      if (x.materialId !== y.materialId) return x.materialId - y.materialId
      if (x.rapNo !== y.rapNo) return x.rapNo - y.rapNo
      return x.sectionId - y.sectionId
    })
  }
  return buckets
}
