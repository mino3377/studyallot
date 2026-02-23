// app/(private)/(materials)/(material)/material/[slug]/page-body.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Pencil, Trash2,} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MaterialCheckTable from "@/app/(private)/(materials)/(material)/material/[slug]/material-check-table";
import ProgressRateCard from "@/components/infocards/progress-rate-card";
import { saveSectionRecords } from "@/app/(private)/(materials)/(material)/material/[slug]/actions";
import { getMaterialData } from "./data";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return d.slice(0, 10).replaceAll("-", "/");
}

export default async function MaterialPageBody(props: {
  userId: string;
  materialSlug: string;
  todayISO: string;
  userTZ: string;
}) {
  const vm = await getMaterialData(props.userId, props.materialSlug, props.todayISO, props.userTZ);
  if (!vm) notFound();

  const { mat, project, plan, sections, initialRecords, stats, todayISO, todaysAssignment } = vm;

  const status: "ahead" | "on" | "behind" =
    stats.avgActualPct > stats.avgPlannedPct ? "ahead" : stats.avgActualPct < stats.avgPlannedPct ? "behind" : "on";

  async function deleteMaterialAction() {
    "use server";
    const supa = await createClient();
    const { data: auth2 } = await supa.auth.getUser();
    if (!auth2?.user) redirect("/login");

    await supa.from("section_records").delete().eq("user_id", auth2.user.id).in(
      "section_id",
      (await supa.from("sections").select("id").eq("material_id", mat.id).eq("user_id", auth2.user.id)).data?.map(x => x.id) ?? [-1]
    );
    await supa.from("sections").delete().eq("user_id", auth2.user.id).eq("material_id", mat.id);
    await supa.from("plans").delete().eq("user_id", auth2.user.id).eq("material_id", mat.id);

    const { error } = await supa.from("materials").delete()
      .eq("user_id", auth2.user.id)
      .eq("id", mat.id);
    if (error) throw new Error(error.message);

    redirect(`/project/${project.slug}`);
  }

  async function saveSectionRecordsAction(fd: FormData) {
    "use server";
    await saveSectionRecords(fd);
  }

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {fmtDate(plan.startISO)} — {fmtDate(plan.endISO)}
            </span>

          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <div className="">
          <div className="font-bold text-2xl">{mat.title}</div>
          <div className="flex space-y-1 ml-1 items-end">
            <div className="text-sm text-muted-foreground">{project.name}</div>
          </div>
        </div>

        <div className="flex items-end gap-1">
          <Button asChild variant="ghost" size="sm" title="編集">
            <Link href={`/material/${mat.slug}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" title="削除" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>この教材を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  関連する教材データも削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" formAction={deleteMaterialAction}>
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {(stats.totalCells > 0) ? (
        <Card className="p-4 space-y-1 gap-1">
          <div className="text-l font-medium">本日のタスク（{todayISO}）</div>
          {todaysAssignment.length === 0 ? (
            <div className="text-sm text-muted-foreground">なし</div>
          ) : (
            <div className="text-sm ml-1.5">
              {Object.entries(
                todaysAssignment.reduce<Record<string, string[]>>((acc, c) => {
                  const k = `${c.round}周目`;
                  acc[k] = acc[k] ?? [];
                  acc[k].push(c.title);
                  return acc;
                }, {})
              ).map(([k, titles]) => (
                <div key={k} className="mt-1">
                  <span className="font-medium">{k}：</span>
                  <span className="text-muted-foreground">{titles.join("、")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">セクションまたは周回数が未設定です</div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-1">
        <ProgressRateCard avgActualPct={stats.avgActualPct} avgPlannedPct={stats.avgPlannedPct} />
      </div>

      <MaterialCheckTable
        materialId={mat.id}
        rounds={plan.rounds}
        sections={sections}
        initialRecords={initialRecords}
        todayISO={todayISO}
        planId={plan.id}
        saveAction={saveSectionRecordsAction}
      />
    </div>
  );
}
