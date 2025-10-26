// 空文字→null、数値は0–168の整数にクランプ
export function parseWeeklyHours(raw: string): number | null {
  const s = (raw ?? "").trim()
  if (s === "") return null
  const n = Math.trunc(Number(s))
  if (Number.isNaN(n)) return null
  if (n < 0 || n > 168) return null
  return n
}
