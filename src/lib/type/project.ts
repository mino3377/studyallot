export type Purpose =
  | "language"
  | "exam"
  | "license"
  | "research"
  | "hobby"
  | "other"
  | "skill"
  | "reading"
  | "test"

export const PURPOSE_LABEL: Record<Purpose, string> = {
  language: "語学",
  exam: "受験",
  license: "資格",
  research: "研究",
  hobby: "趣味",
  other: "その他",
  skill: "スキル学習",
  reading: "読書",
  test: "定期テスト",
}
