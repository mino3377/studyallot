// 直線化スケジュールのオンザフライ生成ユーティリティ
// - セクション×周回を 1..N に直線化
// - 期間 [start, end] を日割りで均等配分（余りは開始日に前倒し）
// - 今日の割当、計画進捗%を計算
//
// すべてローカル日付(00:00)基準で扱い、UTC丸めのズレを回避

export type SectionLite = { id: number; order: number; title: string }

function toLocalISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}
function parseISO(iso?: string | null) {
  return iso ? new Date(`${iso}T00:00:00`) : undefined
}
function daysDiffInclusive(aISO: string, bISO: string) {
  const a = parseISO(aISO)!, b = parseISO(bISO)!
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / 86400000) + 1 // 両端含む
}

/** セクション×周回を直線化（1始まりインデックス） */
export function enumerateCells(sections: SectionLite[], rounds: number) {
  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const out: Array<{ globalIndex: number; sectionId: number; round: number; title: string }> = []
  let idx = 1
  for (let r = 1; r <= rounds; r++) {
    for (const s of sorted) {
      out.push({ globalIndex: idx++, sectionId: s.id, round: r, title: s.title ?? `セクション${s.order}` })
    }
  }
  return out
}

/** 総セル数を期間日数で均等割、[startIdx, endIdx]（1始まり）を日次配列で返す */
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

/** 今日インデックス（範囲外はクランプ）と、今日までにやるべき累積セル数 */
export function computePlannedCellsUntilToday(totalCells: number, startISO: string, endISO: string, todayISO: string) {
  if (!startISO || !endISO || totalCells <= 0) {
    return { plannedCells: 0, plannedPct: 0, dayIndex: -1, totalDays: 0 }
  }
  const totalDays = Math.max(1, daysDiffInclusive(startISO, endISO))
  const alloc = buildDailyAllocation(totalCells, startISO, endISO)

  // dayIndex: 0-based
  const d0 = parseISO(startISO)!, dToday = parseISO(todayISO)!
  const raw = Math.floor((dToday.getTime() - d0.getTime()) / 86400000)
  const dayIndex = Math.min(Math.max(raw, 0), totalDays - 1)

  // 今日が開始前か終了後かの判定用
  const beforeStart = raw < 0
  const afterEnd = raw >= totalDays

  let plannedCells = 0
  if (beforeStart) {
    plannedCells = 0
  } else if (afterEnd) {
    plannedCells = totalCells
  } else {
    // 今日分までの累積
    for (let i = 0; i <= dayIndex; i++) {
      const r = alloc[i]
      if (r.end >= r.start) plannedCells += (r.end - r.start + 1)
    }
  }
  const plannedPct = totalCells > 0 ? Math.round((plannedCells / totalCells) * 100) : 0
  return { plannedCells, plannedPct, dayIndex, totalDays }
}

/** 今日やるべきセル配列（直線化配列から切り出し） */
export function pickTodayAssignment(
  sections: SectionLite[],
  rounds: number,
  startISO: string | null | undefined,
  endISO: string | null | undefined,
  todayISO: string
) {
  if (!startISO || !endISO || rounds <= 0 || sections.length === 0) return []
  const cells = enumerateCells(sections, rounds)
  const totalCells = cells.length
  const ranges = buildDailyAllocation(totalCells, startISO, endISO)

  // dayIndex計算（クランプ）
  const totalDays = Math.max(1, daysDiffInclusive(startISO, endISO))
  const d0 = parseISO(startISO)!, dToday = parseISO(todayISO)!
  const raw = Math.floor((dToday.getTime() - d0.getTime()) / 86400000)
  const dayIndex = Math.min(Math.max(raw, 0), totalDays - 1)

  const { start, end } = ranges[dayIndex]
  if (end < start) return []
  // globalIndex は 1始まりなので -1
  return cells.slice(start - 1, end)
}

/** 便利：ローカル今日 */
export function todayLocalISO() {
  return toLocalISODate(new Date())
}
