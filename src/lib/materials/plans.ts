// src/lib/materials/plans.ts
import { isOverlapUTC, toUtcMidnightEpoch } from "./dates";

type PlanInput = {
  name: string;
  start_date: string;
  end_date: string;
  rounds: number;
  is_active?: boolean;
};

export function assertNoOverlap(plans: PlanInput[]) {
  const arr = [...plans].sort((a, b) => a.start_date.localeCompare(b.start_date));
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (isOverlapUTC(arr[i].start_date, arr[i].end_date, arr[j].start_date, arr[j].end_date)) {
        throw new Error(`プラン「${arr[i].name}」と「${arr[j].name}」の期間が重複しています。`);
      }
    }
  }
}

export function normalizeActive(plans: PlanInput[], todayISO: string): PlanInput[] {
  const anyTrue = plans.some(p => p.is_active === true);
  let normalized = plans.map(p => ({ ...p }));

  if (anyTrue) {
    // trueが複数でもOK → ここで1つに正規化（今日以降で最も早い開始 or 最も早いtrue）
    const futureOrToday = normalized
      .filter(p => toUtcMidnightEpoch(p.start_date) >= toUtcMidnightEpoch(todayISO))
      .sort((a, b) => a.start_date.localeCompare(b.start_date));

    const chosen =
      futureOrToday[0] ??
      normalized
        .filter(p => p.is_active)
        .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

    normalized = normalized.map(p => ({ ...p, is_active: p.name === chosen.name }));
  } else {
    // 全false許容。ただし既定は今日以降で最短開始をtrueに。
    const futureOrToday = normalized
      .filter(p => toUtcMidnightEpoch(p.start_date) >= toUtcMidnightEpoch(todayISO))
      .sort((a, b) => a.start_date.localeCompare(b.start_date));

    if (futureOrToday.length > 0) {
      const chosen = futureOrToday[0];
      normalized = normalized.map(p => ({ ...p, is_active: p.name === chosen.name }));
    }
  }

  return normalized;
}
