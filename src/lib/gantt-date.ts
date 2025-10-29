// C:\Users\chiso\nextjs\study-allot\src\lib\gantt-date.ts

/** パース（'YYYY-MM-DD' 想定）。不正なら null */
export function parseISODate(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

/** 'YYYY-MM-DD' へ */
export function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

/** 同日比較（UTCでなくローカル想定） */
export function cmpDate(a: Date, b: Date): number {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aa - bb;
}

/** min/max（nullは無視） */
export function minMax(dates: (Date | null | undefined)[]) {
  let min: Date | null = null, max: Date | null = null;
  for (const d of dates) {
    if (!d) continue;
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }
  return { min, max };
}

/** 月配列（start〜endを含む月初の配列） */
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

/** 日配列（start〜endを含む毎日） */
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

/** 今日（ユーザー現地タイムゾーンのローカル日付） */
export function todayLocalISO(): string {
  const now = new Date();
  return fmtISO(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** 月ラベル（数字 01〜12） */
export function monthMM(d: Date): string {
  return String(d.getMonth() + 1).padStart(2, "0");
}

/** 日ラベル（01〜31） */
export function dayDD(d: Date): string {
  return String(d.getDate()).padStart(2, "0");
}
