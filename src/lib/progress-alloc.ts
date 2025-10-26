// 進捗のオンザフライ計算ユーティリティ（計画％・計画セル数・連続日数）
// - すべて "YYYY-MM-DD" のローカル“日付文字列”を扱う
// - 「今日の決定」は TZ 指定で行い、それ以外の演算は UTC 真夜中で実施してズレを回避

// C:\Users\chiso\nextjs\study-allot\src\lib\progress-alloc.ts

/** 任意タイムゾーンの“今日”を YYYY-MM-DD で返す（例: "Asia/Tokyo"） */
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

/** "YYYY-MM-DD" を UTC の 00:00:00 として Date にする（TZ 非依存で安定） */
export function parseISO(iso?: string | null) {
  if (!iso) return undefined
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
}

/** ISO 日付へ日数加算（UTC 真夜中で演算） */
export function addDaysISO(iso: string, diff: number) {
  const d = parseISO(iso)!
  d.setUTCDate(d.getUTCDate() + diff)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

/** ISO 日付の両端含む日数差（UTC 真夜中で演算） */
export function daysDiffInclusive(aISO: string, bISO: string) {
  const a = parseISO(aISO)!, b = parseISO(bISO)!
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / 86400000) + 1 // 両端含む
}

/** 期間全体を均等割りして日次ごとの [start,end]（1始まり）配列を返す */
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

/** 今日までに計画上「完了しているべきセル数」と計画％（0..100） */
export function computePlannedCellsUntilToday(
  totalCells: number,
  startISO?: string | null,
  endISO?: string | null,
  /** 呼び出し側で toLocalISODate(now, userTZ) を渡すのが推奨 */
  todayISO: string = toLocalISODate(new Date())
) {
  if (!startISO || !endISO || totalCells <= 0) return { plannedCells: 0, plannedPct: 0 }
  const alloc = buildDailyAllocation(totalCells, startISO, endISO)
  const totalDays = alloc.length
  const d0 = parseISO(startISO)!, dToday = parseISO(todayISO)!
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
  const plannedPct = totalCells > 0 ? Math.round((plannedCells / totalCells) * 100) : 0
  return { plannedCells, plannedPct }
}

/** 連続日数（今日から連続して「完了が1件以上ある日」が何日続いているか） */
export function computeStreak(
  dateSet: Set<string>,
  /** 呼び出し側で toLocalISODate(now, userTZ) を渡すのが推奨 */
  todayISO: string = toLocalISODate(new Date())
) {
  let streak = 0
  let cursor = todayISO
  while (dateSet.has(cursor)) {
    streak++
    cursor = addDaysISO(cursor, -1)
  }
  return streak
}
