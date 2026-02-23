import "server-only";
import { createClient } from "@/utils/supabase/server";
import { MaterialPlanInput, SectionLite } from "./daily-assignment";

export async function getUserAuth() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  return { sb, userId: auth?.user?.id ?? null };
}

export async function fetchMaterialsWithActivePlans(userId: string) {
  const { sb } = await getUserAuth();

  const { data: mats } = await sb
    .from("materials")
    .select("id, slug, title")
    .eq("user_id", userId);

  const out: Array<
    MaterialPlanInput & { planId: number }
  > = [];

  for (const m of mats ?? []) {
    const { data: plans } = await sb
      .from("plans")
      .select("id, total_units, rounds, start_date, end_date, is_active")
      .eq("material_id", m.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const plan = (plans ?? []).find(p => p.is_active) ?? (plans ?? [])[0];
    if (!plan) continue;

    const totalUnits = Number(plan.total_units ?? 0);
    const rounds = Math.max(1, Number(plan.rounds ?? 1));

    const { data: secs } = await sb
      .from("sections")
      .select("id, order_key, title")
      .eq("user_id", userId)
      .eq("material_id", m.id)
      .order("order_key", { ascending: true });

    let sections: SectionLite[] =
      (secs?.map(s => ({
        id: s.id,
        order: s.order_key ?? 0,
        title: s.title ?? `セクション${s.order_key ?? ""}`,
        materialId: m.id,
      })) ?? []);

    if (sections.length === 0 && totalUnits > 0) {
      sections = Array.from({ length: totalUnits }, (_, i) => ({
        id: -(i + 1),
        order: i + 1,
        title: `セクション${i + 1}`,
        materialId: m.id,
      }));
    }

    out.push({
      planId: plan.id,
      materialId: m.id,
      materialSlug: m.slug,
      materialTitle: m.title,
      rounds,
      startISO: plan.start_date!,
      endISO: plan.end_date!,
      sections,
    });
  }

  return out;
}

export async function fetchRecordsForWeekByPlans(
  userId: string,
  planIds: number[],
  minDateISO: string,
  maxDateISO: string
) {
  if (planIds.length === 0) return [];
  const { sb } = await getUserAuth();

  const { data: recs } = await sb
    .from("section_records")
    .select("plan_id, section_id, rap_no, recorded_on")
    .eq("user_id", userId)
    .in("plan_id", planIds)
    .gte("recorded_on", minDateISO)
    .lte("recorded_on", maxDateISO);

  return recs ?? [];
}
