// C:\Users\chiso\nextjs\study-allot\src\lib\progress-alloc.ts

export function toLocalISODate(
  d: Date,
  tz: string = (typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC") || "UTC"
) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d)
  const y = parts.find(p => p.type === "year")?.value ?? "0000"
  const m = parts.find(p => p.type === "month")?.value ?? "01"
  const dd = parts.find(p => p.type === "day")?.value ?? "01"
  return `${y}-${m}-${dd}`
}

export function parseISO(iso?: unknown) {
  if (iso == null || typeof iso !== "string") return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return undefined
  const y = Number(m[1])
  const mo = Number(m[2])
  const d  = Number(m[3])
  const date = new Date(Date.UTC(y, mo - 1, d))
  return (date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d)
    ? date
    : undefined
}

export function addDaysISO(iso: string, diff: number) {
  const d = parseISO(iso)!
  d.setUTCDate(d.getUTCDate() + diff)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

export function daysDiffInclusive(aISO: string, bISO: string) {
  const a = parseISO(aISO)!, b = parseISO(bISO)!
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / 86400000) + 1 // 両端含む
}

/** 期間全体を均等割りして日ごとの [start,end]配列を返す */
export function buildDailyAllocation(totalCells: number, startISO: string, endISO: string) {
  const totalDays = Math.max(1, daysDiffInclusive(startISO, endISO))
  const base = Math.floor(totalCells / totalDays)
  const rem = totalCells % totalDays
  const ranges: Array<{ start: number; end: number }> = []
  let cur = 1
  for (let day = 0; day < totalDays; day++) {
    const cnt = base + (day < rem ? 1 : 0)
    const start = cur
    const end = cnt > 0 ? cur + cnt - 1 : cur - 1
    ranges.push({ start, end })
    cur += cnt
  }
  return ranges
}

export function computePlannedCellsUntilToday(
  totalCells: number,
  startISO?: string | null,
  endISO?: string | null,
  todayISO: string = toLocalISODate(new Date())
) {
  if (!startISO || !endISO || totalCells <= 0) return { plannedCells: 0, plannedPct: 0 }

  const d0 = parseISO(startISO)
  const dToday = parseISO(todayISO)

  if (!d0 || !dToday) return { plannedCells: 0, plannedPct: 0 }

  const alloc = buildDailyAllocation(totalCells, startISO, endISO)
  const totalDays = alloc.length
  const raw = Math.floor((dToday.getTime() - d0.getTime()) / 86400000)

  let plannedCells = 0
  if (raw < 0) plannedCells = 0
  else if (raw >= totalDays) plannedCells = totalCells
  else {
    for (let i = 0; i <= raw; i++) {
      const r = alloc[i]
      if (r.end >= r.start) plannedCells += (r.end - r.start + 1)
    }
  }
  const plannedPct = totalCells > 0 ? Math.floor((plannedCells / totalCells) * 100) : 0
  return { plannedCells, plannedPct }
}


