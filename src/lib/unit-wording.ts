// C:\Users\chiso\nextjs\study-allot\src\components\unit-wording.ts

import type { UnitType } from "@/lib/type/unit-type"
import { unitLabel } from "@/lib/type/unit-type"

export function unitLabelByType(unitType: UnitType) {
  return unitLabel(unitType)
}

export function unitOrdinal(unitType: UnitType, n: number) {
  if (unitType === "chapter") return `${n}章`
  if (unitType === "page") return `${n}ページ`
  return `${unitLabel(unitType)}${n}`
}

export function taskLabelSingle(unitType: UnitType, unitNo: number, lap: number) {
  return `${unitOrdinal(unitType, unitNo)}/${lap}周目`
}

export function taskLabelRange(unitType: UnitType, fromUnit: number, toUnit: number, lap: number) {
  return `${unitOrdinal(unitType, fromUnit)} ${lap}周目 〜 ${unitOrdinal(unitType, toUnit)} ${lap}周目`
}