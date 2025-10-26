// C:\Users\chiso\nextjs\study-allot\src\lib\daily-assignment.ts

/**
 * 「その日のタスク（デイリー割当）」を一貫して計算するユーティリティ。
 * - 全画面（Material 詳細 / デイリータスク週表示）でこのロジックを参照してズレを排除
 * - 任意TZの YYYY-MM-DD を安全に扱い、UTC/JST/サマータイムの食い込みを回避
 */

export type SectionLite = {
  id: number;          // セクションID（ダミー生成時は負数）
  order: number;       // 並び順（1-based）
  title: string;       // セクション名（例：セクション5）
  materialId?: number; // 週表示向け：元の教材ID（Material詳細なら不要）
};

export type DailyTask = {
  id: string;          // dayISO:materialId:sectionId:rapNo
  materialId: number;
  material: string;    // 教材名
  unitLabel: string;   // 表示範囲（例：「セクション5（1周目）」）
  sectionId: number;
  rapNo: number;       // 1..rounds
};

export type DayBucket = {
  dateISO: string;     // YYYY-MM-DD（ユーザーTZ基準）
  tasks: DailyTask[];
};

/* =========================
 *   TZ安全な日付ユーティリティ
 * ========================= */

/** 任意TZで YYYY-MM-DD を作成（Date をそのTZの暦日に丸める） */
export function toZonedISODate(d: Date, tz: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const p = fmt.formatToParts(d);
  const y = p.find((x) => x.type === "year")?.value ?? "1970";
  const m = p.find((x) => x.type === "month")?.value ?? "01";
  const dd = p.find((x) => x.type === "day")?.value ?? "01";
  return `${y}-${m}-${dd}`;
}

/** TZ前提の YYYY-MM-DD に日数加算して同じTZで YYYY-MM-DD を返す */
export function addDaysZoned(baseISO: string, days: number, tz: string): string {
  // ローカル解釈の正午にして±1日の食い込みを防ぐ
  const d = new Date(`${baseISO}T12:00:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return toZonedISODate(d, tz);
}

/** 2つの YYYY-MM-DD（同一TZ前提）の差（日数, end含む/含まない制御） */
export function diffDaysInclusive(startISO: string, endISO: string, tz: string): number {
  const s = new Date(`${startISO}T12:00:00`);
  const e = new Date(`${endISO}T12:00:00`);
  // 含む（期間長として使う）: +1
  const ms = e.getTime() - s.getTime();
  const raw = Math.floor(ms / 86400000);
  return raw + 1;
}

/** start..end（YYYY-MM-DD, 同一TZ）を inclusive に列挙 */
export function enumerateDatesInclusive(startISO: string, endISO: string, tz: string): string[] {
  const days = diffDaysInclusive(startISO, endISO, tz);
  return Array.from({ length: Math.max(0, days) }, (_, i) => addDaysZoned(startISO, i, tz));
}

/* =========================
 *   コア：日割り配分ロジック
 * ========================= */

/**
 * totalCells（= sections.length * rounds）を totalDays に均等配分した配列を返す。
 * 例）totalCells=10, totalDays=3 => [4,3,3]（余りは先頭から +1）
 */
export function distributeCellsPerDay(totalCells: number, totalDays: number): number[] {
  if (totalDays <= 0) return [];
  const base = Math.floor(totalCells / totalDays);
  const rem = totalCells % totalDays;
  // 先頭 rem 日に +1 ずつ
  return Array.from({ length: totalDays }, (_, i) => base + (i < rem ? 1 : 0));
}

/** セルIndex(0-based) -> (roundNo, sectionIndex) を求める */
export function cellIndexToRoundSection(cellIndex: number, sectionsCount: number): { roundNo: number; sectionIndex: number } {
  const roundNo = Math.floor(cellIndex / sectionsCount) + 1;  // 1..rounds
  const sectionIndex = cellIndex % sectionsCount;             // 0..sectionsCount-1
  return { roundNo, sectionIndex };
}

/**
 * 指定日の割当を返す（セクションが複数でも“その日の分すべて”返す）
 * - sections: 並び順（order昇順）で与えること
 * - rounds: 1以上
 * - startISO～endISO: ユーザーTZでの期間（inclusive）
 * - dateISO: ユーザーTZの対象日
 */
export function assignmentForDate(
  sections: SectionLite[],
  rounds: number,
  startISO: string,
  endISO: string,
  dateISO: string,
  tz: string
): { title: string; round: number; sectionId: number }[] {
  const totalSections = sections.length;
  const totalCells = totalSections * Math.max(1, rounds);
  if (totalSections === 0 || totalCells === 0) return [];

  // 期間中の各日のセル配分
  const days = diffDaysInclusive(startISO, endISO, tz);
  if (days <= 0) return [];

  const perDay = distributeCellsPerDay(totalCells, days);

  // 対象日の dayIndex（0-based）
  const allDays = enumerateDatesInclusive(startISO, endISO, tz);
  const dayIndex = allDays.indexOf(dateISO);
  if (dayIndex < 0) return []; // 範囲外

  // 当日分のセル範囲 [startCell, endCell)
  const startCell = perDay.slice(0, dayIndex).reduce((a, b) => a + b, 0);
  const count = perDay[dayIndex];
  const endCell = startCell + count;

  const out: { title: string; round: number; sectionId: number }[] = [];
  for (let c = startCell; c < endCell; c++) {
    const { roundNo, sectionIndex } = cellIndexToRoundSection(c, totalSections);
    const sec = sections[sectionIndex];
    out.push({
      title: sec.title,
      round: roundNo,
      sectionId: sec.id,
    });
  }
  return out;
}

/* =========================
 *   週（DayBucket[]）を構築
 * ========================= */

export type MaterialPlanInput = {
  materialId: number;
  materialTitle: string;
  rounds: number;                // 1..N
  startISO: string;              // YYYY-MM-DD (ユーザーTZ)
  endISO: string;                // YYYY-MM-DD (ユーザーTZ)
  sections: SectionLite[];       // order昇順
};

/**
 * 指定週（weekStartISO から7日）について、全教材の割当をまとめて DayBucket[] を構築。
 * - weekStartISO はユーザーTZの月曜(or 任意開始日)の YYYY-MM-DD を渡す
 * - 期間外の日は tasks=[] のまま
 */
export function buildWeekBuckets(
  inputs: MaterialPlanInput[],
  weekStartISO: string,
  tz: string
): DayBucket[] {
  const days = Array.from({ length: 7 }, (_, i) => addDaysZoned(weekStartISO, i, tz));
  const buckets: DayBucket[] = days.map((d) => ({ dateISO: d, tasks: [] }));

  for (const m of inputs) {
    if (!m.sections?.length || m.rounds <= 0) continue;

    for (let i = 0; i < 7; i++) {
      const dayISO = buckets[i].dateISO;

      // 期間外はスキップ
      if (dayISO < m.startISO || dayISO > m.endISO) continue;

      const assigns = assignmentForDate(m.sections, m.rounds, m.startISO, m.endISO, dayISO, tz);
      for (const a of assigns) {
        const task: DailyTask = {
          id: `${dayISO}:${m.materialId}:${a.sectionId}:${a.round}`,
          materialId: m.materialId,
          material: m.materialTitle,
          unitLabel: `${a.title}（${a.round}周目）`,
          sectionId: a.sectionId,
          rapNo: a.round,
        };
        buckets[i].tasks.push(task);
      }
    }
  }

  // 各日の tasks を教材→セクション順に軽く整列（安定化）
  for (const b of buckets) {
    b.tasks.sort((x, y) => {
      if (x.materialId !== y.materialId) return x.materialId - y.materialId;
      if (x.rapNo !== y.rapNo) return x.rapNo - y.rapNo;
      return x.sectionId - y.sectionId;
    });
  }

  return buckets;
}
