// src/lib/unit-type.ts

export const UNIT_TYPE_ITEMS = [
  { id: "section", label: "セクション" },
  { id: "chapter", label: "章" },
  { id: "page", label: "ページ" },
  { id: "unit", label: "ユニット" },
  { id: "problem", label: "問題" },
  { id: "question", label: "問" },
  { id: "part", label: "パート" },
  { id: "lesson", label: "レッスン" },
] as const

export type UnitType = (typeof UNIT_TYPE_ITEMS)[number]["id"]

export function unitLabel(unitType: UnitType): string {
  const found = UNIT_TYPE_ITEMS.find((x) => x.id === unitType)
  return found?.label ?? "セクション"
}

export function isUnitType(v: unknown): v is UnitType {
  return UNIT_TYPE_ITEMS.some((x) => x.id === v)
}

export function normalizeUnitType(v: unknown): UnitType {
  const s = String(v ?? "").trim().toLowerCase()
  if (isUnitType(s)) return s
  return "section"
}