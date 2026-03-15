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

export const UNIT_TYPE_IDS = [
  "section",
  "chapter",
  "page",
  "unit",
  "problem",
  "question",
  "part",
  "lesson",
] as const

export type unit_type = (typeof UNIT_TYPE_ITEMS)[number]["id"]

export function unitLabel(unit_type: unit_type): string {
  const found = UNIT_TYPE_ITEMS.find((x) => x.id === unit_type)
  return found?.label ?? "セクション"
}