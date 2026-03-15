import { eachDayOfInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import { iso } from "@/lib/date/date"

export type ProjectTask = {
  id: string
  unitNo: number
  round: number
}

//その教材の周回数、セクション数の情報の配列
export function makeAllTasks(rounds: number, unit_count: number): ProjectTask[] {
  const out: ProjectTask[] = []
  for (let round = 1; round <= rounds; round++) {
    for (let u = 1; u <= unit_count; u++) {
      out.push({ id: `R${round}-U${u}`, unitNo: u, round: round })
    }
  }
  return out
}

//日付とその日のタスク配列（１周目のユニット３～どこまで）のオブジェクトを返す
export function buildPlanMapFromDays(
  range: DateRange,
  tasks: ProjectTask[],
  plan_days: number[]
): Record<string, ProjectTask[]> {
  const from = range.from
  const to = range.to
  const map: Record<string, ProjectTask[]> = {}
  if (!from || !to) return map

  const days = eachDayOfInterval({ start: from, end: to })

  let acc = 0

  for (let i = 0; i < days.length; i++) {
    const todayTask = tasks.slice(acc, acc + plan_days[i])
    map[iso(days[i])] = todayTask
    acc += plan_days[i]
  }

  return map
}

//日付とその日のタスク数のオブジェクトを返す
export function buildCountMapFromDays(
  range: DateRange,
  actual_days: number[]
): Record<string, number> {
  const from = range.from
  const to = range.to
  const out: Record<string, number> = {}
  if (!from || !to) return out

  const days = eachDayOfInterval({ start: from, end: to })

  for (let i = 0; i < days.length; i++) {
    const d = iso(days[i])
    const v = actual_days[i]
    out[d] = v
  }

  return out
}

//最初のカレンダーの選択日を決める。基本は「今日」
export function clampToRange(today: Date, range: DateRange) {
  const from = range.from
  const to = range.to
  if (!from || !to) return undefined

  if (today.getTime() < from.getTime()) return from
  if (today.getTime() > to.getTime()) return to
  return today
}