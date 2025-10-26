// C:\Users\chiso\nextjs\study-allot\src\app\(private)\daily-task\page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DailyTasksClient from "./DailyTasksClient";
import { buildWeekBuckets, toZonedISODate, addDaysZoned, MaterialPlanInput, SectionLite } from "@/lib/daily-assignment";

// 端末に依存しないよう、ユーザープロファイルの timezone を使う（無ければ Asia/Tokyo）
async function getUserTimeZone() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return "Asia/Tokyo";
  const { data: prof } = await sb.from("profiles").select("timezone").eq("id", auth.user.id).single();
  return prof?.timezone || "Asia/Tokyo";
}

export default async function DailyTaskPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");

  const userTZ = await getUserTimeZone();

  // 「今週」：ユーザーTZの“今日”を基準に週開始（例：月曜）を出す
  const todayISO = toZonedISODate(new Date(), userTZ);
  // ここでは簡易に：今日を週の先頭とする（必要なら月曜始まりに調整）
  const weekStartISO = todayISO; // ← 必要なら util で Monday-start に変えてOK

  // ユーザーの全教材＋アクティブプランを取得
  const { data: mats } = await supabase
    .from("materials")
    .select("id, title, user_id")
    .eq("user_id", auth.user.id);

  const materialInputs: MaterialPlanInput[] = [];

  for (const m of mats ?? []) {
    // アクティブプラン（無ければ最新）を取得
    const { data: plans } = await supabase
      .from("plans")
      .select("id, total_units, rounds, start_date, end_date, is_active")
      .eq("material_id", m.id)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    const plan = (plans ?? []).find(p => p.is_active) ?? (plans ?? [])[0];
    if (!plan) continue;

    const totalUnits = Number(plan.total_units ?? 0);
    const rounds = Number(plan.rounds ?? 1);

    // セクションを取得（無ければ total_units 分のダミー）
    const { data: secs } = await supabase
      .from("sections")
      .select("id, order_key, title")
      .eq("user_id", auth.user.id)
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

    materialInputs.push({
      materialId: m.id,
      materialTitle: m.title,
      rounds,
      startISO: plan.start_date!,
      endISO: plan.end_date!,
      sections,
    });
  }

  // 週構築（7日）
  const week = buildWeekBuckets(materialInputs, weekStartISO, userTZ);

  // 既存チェック状態の初期値（recorded_on がその日のISOと一致するもの）
  const initialChecked: Record<string, boolean> = {};
  // まとめてクエリするために対象 sectionId / rapNo / date のキーを集めたいが、
  // 今回は簡易化のため、週範囲でレコードを取得して突合する
  const weekDates = week.map(d => d.dateISO);
  const minDate = weekDates[0];
  const maxDate = weekDates[weekDates.length - 1];

  // 該当週の学習記録を取得
  const { data: recs } = await supabase
    .from("section_records")
    .select("section_id, rap_no, recorded_on")
    .eq("user_id", auth.user.id)
    .gte("recorded_on", minDate)
    .lte("recorded_on", maxDate);

  // マッピング
  for (const day of week) {
    for (const t of day.tasks) {
      const hit = (recs ?? []).some(r =>
        r.section_id === t.sectionId &&
        r.rap_no === t.rapNo &&
        r.recorded_on === day.dateISO
      );
      if (hit) {
        initialChecked[`${day.dateISO}:${t.id.split(":").slice(1).join(":")}`] = true;
        // ただし、DailyTasksClient 側は `${dayISO}:${task.id}` 形式なので、
        // ここでは素直に：
        initialChecked[`${day.dateISO}:${t.id}`] = true;
      }
    }
  }

  // 保存アクション（既存のを流用）
  async function saveRecords(fd: FormData): Promise<{ ok: boolean; message?: string }> {
    "use server";
    // 既存の server action を呼び出す場合は import して委譲してください
    // ここでは最小構成として直接 Supabase upsert/delete を行ってもOK
    try {
      const sb = await createClient();
      const { data: auth2 } = await sb.auth.getUser();
      if (!auth2?.user) return { ok: false, message: "not signed in" };

      const payload = JSON.parse(String(fd.get("payload") || "{}")) as {
        upserts: Array<{ sectionId: number; rapNo: number; recordedOn: string }>;
        deletes: Array<{ sectionId: number; rapNo: number; recordedOn: string }>;
      };

      // upsert
      for (const u of payload.upserts ?? []) {
        await sb.from("section_records").upsert({
          user_id: auth2.user.id,
          section_id: u.sectionId,
          rap_no: u.rapNo,
          recorded_on: u.recordedOn, // YYYY-MM-DD
        }, { onConflict: "user_id,section_id,rap_no,recorded_on" });
      }

      // delete
      for (const d of payload.deletes ?? []) {
        await sb
          .from("section_records")
          .delete()
          .eq("user_id", auth2.user.id)
          .eq("section_id", d.sectionId)
          .eq("rap_no", d.rapNo)
          .eq("recorded_on", d.recordedOn);
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "save error" };
    }
  }

  return (
    <DailyTasksClient
      week={week}
      initialChecked={initialChecked}
      saveAction={saveRecords}
    />
  );
}
