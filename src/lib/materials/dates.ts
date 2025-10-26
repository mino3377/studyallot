// src/lib/materials/dates.ts

// "YYYY-MM-DD" -> UTCミッドナイトのepoch
export function toUtcMidnightEpoch(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

// [start, end] が接触含めて重複するか（端点NG仕様）
export function isOverlapUTC(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const aS = toUtcMidnightEpoch(aStart);
  const aE = toUtcMidnightEpoch(aEnd);
  const bS = toUtcMidnightEpoch(bStart);
  const bE = toUtcMidnightEpoch(bEnd);
  // 接触もNG: aE < bS || bE < aS なら非重複 → それ以外は重複
  return !(aE < bS || bE < aS);
}
