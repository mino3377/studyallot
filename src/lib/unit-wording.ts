// C:\Users\chiso\nextjs\study-allot\src\components\unit-wording.ts

import type { unit_type } from "@/lib/type/unit-type"
import { unitLabel } from "@/lib/type/unit-type"

export function unitLabelByType(unit_type: unit_type) {
  return unitLabel(unit_type)
}

export function unitOrdinal(unit_type: unit_type, n: number) {
  if (unit_type === "chapter") return `${n}章`
  if (unit_type === "page") return `${n}ページ`
  return `${unitLabel(unit_type)}${n}`
}

export function taskLabelSingle(unit_type: unit_type, unitNo: number, lap: number) {
  return `${unitOrdinal(unit_type, unitNo)}/${lap}周目`
}

export function taskLabelRange(unit_type: unit_type, fromUnit: number, toUnit: number, lap: number) {
  return `${unitOrdinal(unit_type, fromUnit)} ${lap}周目 〜 ${unitOrdinal(unit_type, toUnit)} ${lap}周目`
}