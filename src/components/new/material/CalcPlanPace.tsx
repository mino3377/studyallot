// C:\Users\chiso\nextjs\study-allot\src\components\materials\CalcPlanPace.tsx

export type PlanPaceOk = {
  ok: true;
  days: number;      
  totalWork: number; 
  perDay: number;    
  perDayCeil: number;
  perWeek: number;   
};

export type PlanPaceNg = {
  ok: false;
  message: string;
};

export type PlanPaceResult = PlanPaceOk | PlanPaceNg;

function daysInclusive(startISO?: string, endISO?: string): number | null {
  if (!startISO || !endISO) return null;

  const s = new Date(`${startISO}T00:00:00Z`).getTime();
  const e = new Date(`${endISO}T00:00:00Z`).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  if (e < s) return null;

  return Math.floor((e - s) / 86400000) + 1;
}

export function calcPlanPace(params: {
  startISO?: string;
  endISO?: string;
  totalUnits?: number;
  rounds?: number;
}): PlanPaceResult {
  const { startISO, endISO, totalUnits, rounds } = params;

  const days = daysInclusive(startISO, endISO);
  if (!days) return { ok: false, message: "開始日と終了日を正しく入力してください。" };

  if (!totalUnits || totalUnits <= 0) {
    return { ok: false, message: "総セクション数を入力してください。" };
  }
  if (!rounds || rounds <= 0) {
    return { ok: false, message: "周回数を入力してください。" };
  }

  const totalWork = totalUnits * rounds;
  const perDay = totalWork / days;
  const perDayCeil = Math.ceil(perDay);
  const perWeek = perDay * 7;

  return { ok: true, days, totalWork, perDay, perDayCeil, perWeek };
}
