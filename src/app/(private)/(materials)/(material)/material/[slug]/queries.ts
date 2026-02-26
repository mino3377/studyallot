// app/(private)/(materials)/(material)/material/[slug]/queries.ts
import "server-only";
import { createClient } from "@/utils/supabase/server";
import { assignmentForDate } from "@/app/(private)/daily-task/daily-assignment";
import { computePlannedCellsUntilToday } from "@/lib/progress-alloc";

export type SectionLite = { id: number; order: number; title: string };

export type MaterialDetailVM = {
  mat: {
    id: number;
    slug: string;
    title: string;
  };
  project: { id: number; name: string; slug: string };
  plan: {
    id?: number;
    totalUnits: number;
    rounds: number;
    startISO: string | null;
    endISO: string | null;
  };
  sections: SectionLite[];
  initialRecords: Record<string, string>; // `${section_id}:${rap_no}` -> 'YYYY-MM-DD'
  stats: {
    totalCells: number;
    completedCells: number;
    avgActualPct: number;
    avgPlannedPct: number;
  };
  todayISO: string;
  userTZ: string;
  todaysAssignment: Array<{ title: string; round: number }>;
};

export async function getMaterialDetailVM(
  userId: string,
  materialSlug: string,
  todayISO: string,
  userTZ: string
): Promise<MaterialDetailVM | null> {
  const sb = await createClient();

  // 教材
  const { data: matRow, error: matErr } = await sb
    .from("materials")
    .select("id, slug, title, project_id")
    .eq("slug", materialSlug)
    .eq("user_id", userId)
    .single();
  if (matErr || !matRow) return null;

  const [
    { data: projRow, error: projErr },
    { data: plansRows },
    { data: secRows },
  ] = await Promise.all([
    sb
      .from("projects")
      .select("id, name, slug")
      .eq("id", matRow.project_id)
      .eq("user_id", userId)
      .single(),
    sb
      .from("plans")
      .select("id, total_units, rounds, start_date, end_date, is_active")
      .eq("material_id", matRow.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    sb
      .from("sections")
      .select("id, order_key, title")
      .eq("material_id", matRow.id)
      .eq("user_id", userId)
      .order("order_key", { ascending: true }),
  ]);
  if (projErr || !projRow) return null;

  // プラン
  const planPick =
    (plansRows ?? []).find((p) => p.is_active) ?? (plansRows ?? [])[0];

  const totalUnits = Number(planPick?.total_units ?? 0);
  const rounds = Math.max(1, Number(planPick?.rounds ?? 1));
  const startISO = planPick?.start_date ?? null;
  const endISO = planPick?.end_date ?? null;

  // セクション
  let sections: SectionLite[] =
    (secRows?.map((s) => ({
      id: s.id,
      order: s.order_key,
      title: s.title,
    })) ?? []);

  if (sections.length === 0 && totalUnits > 0) {
    sections = Array.from({ length: totalUnits }, (_, i) => ({
      id: -(i + 1),
      order: i + 1,
      title: `セクション${i + 1}`,
    }));
  }

  // 進捗記録
  const realSectionIds = sections.filter((s) => s.id > 0).map((s) => s.id);
  const initialRecords: Record<string, string> = {};

  if (realSectionIds.length > 0 && planPick?.id) {
    const { data: recs } = await sb
      .from("section_records")
      .select("section_id, rap_no, recorded_on")
      .eq("user_id", userId)
      .eq("plan_id", planPick.id)
      .in("section_id", realSectionIds);

    for (const r of recs ?? []) {
      const k = `${r.section_id}:${r.rap_no}`;
      const prev = initialRecords[k];
      if (!prev || r.recorded_on > prev) {
        initialRecords[k] = r.recorded_on as string;
      }
    }
  }

  const totalCells = sections.length * rounds;
  const completedCells = Object.keys(initialRecords).length;
  const avgActualPct =
    totalCells > 0 ? Math.floor((completedCells / totalCells) * 100) : 0;

  const planned =
    startISO && endISO && totalCells > 0
      ? computePlannedCellsUntilToday(totalCells, startISO, endISO, todayISO)
      : { plannedCells: 0, plannedPct: 0 };

  const todaysAssignment =
    startISO && endISO && totalCells > 0
      ? assignmentForDate(sections, rounds, startISO, endISO, todayISO, userTZ)
      : [];

  return {
    mat: {
      id: matRow.id,
      slug: matRow.slug,
      title: matRow.title,
    },
    project: { id: projRow.id, name: projRow.name, slug: projRow.slug },
    plan: {
      id: planPick?.id,
      totalUnits,
      rounds,
      startISO,
      endISO,
    },
    sections,
    initialRecords,
    stats: {
      totalCells,
      completedCells,
      avgActualPct,
      avgPlannedPct: planned.plannedPct,
    },
    todayISO,
    userTZ,
    todaysAssignment,
  };
}
