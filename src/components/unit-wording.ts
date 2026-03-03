import { UnitType } from "@/app/(private)/new-add/_components/new-add-primary/material-register-step"




export function unitLabelByType(unitType: UnitType) {
  switch (unitType) {
    case "section":
      return "セクション"
    case "chapter":
      return "章"
    case "page":
      return "ページ"
    case "unit":
      return "ユニット"
    case "problem":
      return "問題"
    case "question":
      return "問"
    case "part":
      return "パート"
    case "lesson":
      return "レッスン"
  }
}

export function unitOrdinal(unitType: UnitType, n: number) {
  if (unitType === "chapter") return `${n}章`
  if (unitType === "page") return `${n}ページ`
  return `${unitLabelByType(unitType)}${n}`
}

export function taskLabelSingle(unitType: UnitType, unitNo: number, lap: number) {
  return `${unitOrdinal(unitType, unitNo)}/${lap}周目`
}

export function taskLabelRange(unitType: UnitType, fromUnit: number, toUnit: number, lap: number) {
  return `${unitOrdinal(unitType, fromUnit)} ${lap}周目 〜 ${unitOrdinal(unitType, toUnit)} ${lap}周目`
}