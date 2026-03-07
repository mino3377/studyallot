export function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

export function toISODate(d: string) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(d), `Invalid date: ${d}`)
  return d
}

export function assertDateOrder(startISO: string, endISO: string) {
  assert(startISO <= endISO, "開始日は終了日より後にできません")
}

export function daysBetweenInclusive(startISO: string, endISO: string) {
  const s = new Date(`${startISO}T00:00:00Z`)
  const e = new Date(`${endISO}T00:00:00Z`)
  const diff = Math.floor((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000))
  return diff + 1
}

export function sum(arr: number[]) {
  let s = 0
  for (const n of arr) s += n
  return s
}

export function isAfterDay(a: Date, b: Date) {
  return a.getTime() > b.getTime()
}

export function isBeforeDay(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}

export function assertNonEmptyTrimmed(value: string | null | undefined, msg: string) {
  const v = (value ?? "").trim()
  assert(v.length > 0, msg)
  return v
}

export function assertPositiveIntUnder1000(value: unknown, msg: string) {
  const n = typeof value === "number" ? value : Number(value)
  assert(Number.isInteger(n), msg)
  assert(n > 0, msg)
  assert(n < 1000, msg)
  return n
}

export function assertPlanDaysValid(
  planDays: unknown,
  dayCount: number,
  totalTasks: number
) {
  assert(Array.isArray(planDays), "計画配分が不正です")
  assert(planDays.length === dayCount, "計画配分の日数が不正です")

  for (const n of planDays) {
    assert(Number.isInteger(n), "計画配分に不正な値があります")
    assert(Number(n) >= 0, "計画配分に不正な値があります")
  }

  assert(sum(planDays as number[]) === totalTasks, "計画配分の合計が総タスク数と一致していません")
}

export function assertProjectInput(
  projectMode: unknown,
  selectedProjectId: string | null | undefined,
  newProjectName: string | null | undefined
) {
  assert(projectMode === "existing" || projectMode === "new", "プロジェクト設定が不正です")

  if (projectMode === "existing") {
    assert(String(selectedProjectId ?? "").trim().length > 0, "プロジェクトを選択してください")
    return
  }

  assertNonEmptyTrimmed(newProjectName, "プロジェクト名を入力してください")
}