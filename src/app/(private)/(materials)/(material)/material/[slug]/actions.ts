//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[slug]\actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

type Upsert = { sectionId: number; rapNo: number; recordedOn: string };
type Del = { sectionId: number; rapNo: number; recordedOn?: string };

export async function saveSectionRecords(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ログインが必要です。" };

  const planIdStr = fd.get("planId")?.toString();
  const planId = planIdStr ? Number(planIdStr) : undefined;
  if (!planId || Number.isNaN(planId)) {
    return { ok: false, message: "プランが選択されていません。" };
  }

  const json = fd.get("payload")?.toString() ?? "{}";
  const payload = JSON.parse(json) as {
    upserts?: Upsert[];
    deletes?: Del[];
  };

  const isISO = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

  const ups = (payload.upserts ?? []).filter(
    r => r.sectionId > 0 && r.rapNo > 0 && isISO(r.recordedOn)
  );

  const dels = (payload.deletes ?? []).filter(
    r => r.sectionId > 0 && r.rapNo > 0 && (!r.recordedOn || isISO(r.recordedOn))
  );

  for (const r of dels) {
    let q = supabase
      .from("section_records")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_id", planId) 
      .eq("section_id", r.sectionId)
      .eq("rap_no", r.rapNo);


    if (r.recordedOn) q = q.eq("recorded_on", r.recordedOn);

    const { error } = await q;
    if (error) return { ok: false, message: error.message };
  }


  for (const r of ups) {
    const delRes = await supabase
      .from("section_records")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_id", planId) 
      .eq("section_id", r.sectionId)
      .eq("rap_no", r.rapNo);

    if (delRes.error) return { ok: false, message: delRes.error.message };

    const insRes = await supabase.from("section_records").insert([{
      user_id: user.id,
      plan_id: planId, 
      section_id: r.sectionId,
      rap_no: r.rapNo,
      recorded_on: r.recordedOn,
    }]);
    if (insRes.error) return { ok: false, message: insRes.error.message };
  }

  return { ok: true };
}
