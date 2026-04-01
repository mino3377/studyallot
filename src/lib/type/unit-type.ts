// src/lib/unit-type.ts

export const unitOptions = [
  { id: "section", title: "セクション" },
  { id: "chapter", title: "章" },
  { id: "page", title: "ページ" },
  { id: "unit", title: "ユニット" },
  { id: "problem", title: "問題" },
  { id: "question", title: "問" },
  { id: "part", title: "パート" },
  { id: "lesson", title: "レッスン" },
]

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

export type unit_type = (typeof unitOptions)[number]["id"]

export function unittitle(unit_type: unit_type): string {
  const found = unitOptions.find((x) => x.id === unit_type)
  return found?.title ?? "セクション"
}