// src/app/(private)/material-editor/validation.ts

export function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

// "yyyy-MM-dd" だけ許す（DBもこの形で持つ前提）
export function toISODate(d: string) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(d), `Invalid date: ${d}`)
  return d
}

// yyyy-MM-dd は文字列比較で大小比較
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