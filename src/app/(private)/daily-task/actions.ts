//C:\Users\chiso\nextjs\study-allot\src\app\(private)\daily-task\actions.ts

"use server";

import { createClient } from "@/utils/supabase/server";

type Upsert = { planId: number; sectionId: number; rapNo: number; recordedOn: string };
type Del = { planId: number; sectionId: number; rapNo: number; recordedOn: string };

export async function saveDailySectionRecords(fd: FormData) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, message: "ログインが必要です。" };

  const json = fd.get("payload")?.toString() ?? "{}";
  const payload = JSON.parse(json) as { upserts?: Upsert[]; deletes?: Del[] };

  const isISO = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

  const ups = (payload.upserts ?? []).filter(
    r => r.planId && r.sectionId > 0 && r.rapNo > 0 && isISO(r.recordedOn)
  );
  const dels = (payload.deletes ?? []).filter(
    r => r.planId && r.sectionId > 0 && r.rapNo > 0 && isISO(r.recordedOn)
  );

  for (const r of dels) {
    const { error } = await sb
      .from("section_records")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_id", r.planId)
      .eq("section_id", r.sectionId)
      .eq("rap_no", r.rapNo)
      .eq("recorded_on", r.recordedOn);
    if (error) return { ok: false, message: error.message };
  }

  for (const r of ups) {
    const delRes = await sb
      .from("section_records")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_id", r.planId)
      .eq("section_id", r.sectionId)
      .eq("rap_no", r.rapNo)
      .eq("recorded_on", r.recordedOn);
    if (delRes.error) return { ok: false, message: delRes.error.message };

    const insRes = await sb
      .from("section_records")
      .insert([{
        user_id: user.id,
        plan_id: r.planId,
        section_id: r.sectionId,
        rap_no: r.rapNo,
        recorded_on: r.recordedOn,
      }]);
    if (insRes.error) return { ok: false, message: insRes.error.message };
  }

  return { ok: true };
}
