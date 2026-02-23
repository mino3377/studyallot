// C:\Users\chiso\nextjs\study-allot\src\lib\gantt-date.ts

export function parseISODate(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

export function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

/** 同日比較 */
export function cmpDate(a: Date, b: Date): number {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aa - bb;
}


//そのプロジェクトのチャートの表示期間を決定
export function minMax(dates: (Date | null | undefined)[]) {
  let min: Date | null = null, max: Date | null = null;
  for (const d of dates) {
    if (!d) continue;
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }
  return { min, max };
}


//7月から12月の期間なら7,8,...,12月までの日付の配列を返す
export function monthsBetween(start: Date, end: Date): Date[] {
  const res: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    res.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return res;
}

//上の月の各日バージョン
export function daysBetween(start: Date, end: Date): Date[] {
  const res: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    res.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return res;
}

/** 月ラベル */
export function monthMM(d: Date): string {
  return String(d.getMonth() + 1).padStart(2, "0");
}

/** 日ラベル */
export function dayDD(d: Date): string {
  return String(d.getDate()).padStart(2, "0");
}
