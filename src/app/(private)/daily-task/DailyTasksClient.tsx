//C:\Users\chiso\nextjs\study-allot\src\app\(private)\daily-task\DailyTasksClient.tsx

"use client";

import { useMemo, useState } from "react";
import TaskDoneCheckbox from "@/components/task-done-checkbox";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DailyTask, DayBucket } from "@/lib/type/daily-task";

// 端末の現地TZ（例：日本なら Asia/Tokyo、ブラジルなら America/Sao_Paulo）
const USER_TZ =
  (typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC") || "UTC";

// "YYYY-MM-DD" → 端末ローカルの正午 Date（前日/翌日ズレ防止）
function parseISOAtLocalNoon(iso: string) {
  return new Date(`${iso}T12:00:00`); // ※ "Z" は付けない（ローカル時刻として解釈）
}

// 日付表示（ユーザー現地TZで表記）
function formatDayLocal(iso: string) {
  const d = parseISOAtLocalNoon(iso);
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: USER_TZ,
  });
  return fmt.format(d);
}

function formatWeekRangeLocal(week: DayBucket[]) {
  if (!week || week.length === 0) return "";
  const start = week[0]?.dateISO;
  const end = week[week.length - 1]?.dateISO;
  if (!start || !end) return "";
  return `${formatDayLocal(start)} 〜 ${formatDayLocal(end)}`;
}

// 1日ぶんのタスクを教材単位でグルーピング
type MaterialGroup = {
  materialId: number;
  material: string;
  tasks: DailyTask[]; // 同一教材の当日分（複数セクション可）
};

export default function DailyTasksClient({
  week,
  initialChecked,
  saveAction,
}: {
  week: DayBucket[];
  initialChecked: Record<string, boolean>;
  saveAction: (fd: FormData) => Promise<{ ok: boolean; message?: string }>;
}) {
  // "day" | "week" 切り替え（デフォルト: 日）
  const [mode, setMode] = useState<"day" | "week">("day");

  const keyOf = (dayISO: string, taskId: string) => `${dayISO}:${taskId}`;

  // 初期チェック状態をコピー
  const [checked, setChecked] = useState<Record<string, boolean>>({ ...initialChecked });

  // 変更があるか（初期状態と比較）
  const hasChanges = useMemo(() => {
    for (const day of week ?? []) {
      for (const t of day.tasks ?? []) {
        const k = keyOf(day.dateISO, t.id);
        const init = !!initialChecked[k];
        const cur = !!checked[k];
        if (init !== cur) return true;
      }
    }
    return false;
  }, [week, checked, initialChecked]);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // 可視データ（「日」は先頭1日。なければ空配列）
  const visibleDays = useMemo<DayBucket[]>(() => {
    if (!week || week.length === 0) return [];
    if (mode === "day") return [week[0]];
    return week;
  }, [mode, week]);

  // 週の範囲（現地TZで表記）
  const weekRange = useMemo(() => formatWeekRangeLocal(week ?? []), [week]);

  // 当日内を教材単位でグルーピング
  function groupByMaterial(day: DayBucket): MaterialGroup[] {
    const map = new Map<number, MaterialGroup>();
    for (const t of day.tasks ?? []) {
      const g = map.get(t.materialId);
      if (g) {
        g.tasks.push(t);
      } else {
        map.set(t.materialId, {
          materialId: t.materialId,
          material: t.material,
          tasks: [t],
        });
      }
    }
    // 表示の安定化：教材ID昇順、次に rapNo, sectionId
    const groups = Array.from(map.values());
    for (const g of groups) {
      g.tasks.sort((a, b) => {
        if (a.rapNo !== b.rapNo) return a.rapNo - b.rapNo;
        if (a.sectionId !== b.sectionId) return a.sectionId - b.sectionId;
        return a.id.localeCompare(b.id);
      });
    }
    groups.sort((a, b) => a.materialId - b.materialId);
    return groups;
  }

  // グループの一括チェック：その教材の当日分をすべて同じ状態に
  function setGroupChecked(dayISO: string, group: MaterialGroup, value: boolean) {
    setChecked((prev) => {
      const next = { ...prev };
      for (const t of group.tasks) {
        next[keyOf(dayISO, t.id)] = Boolean(value);
      }
      return next;
    });
  }

  // グループの現在状態（全てチェックか？）
  function isGroupChecked(dayISO: string, group: MaterialGroup) {
    if (group.tasks.length === 0) return false;
    return group.tasks.every((t) => !!checked[keyOf(dayISO, t.id)]);
  }

  async function handleSave() {
    if (!hasChanges) return;

    setSaving(true);
    setSaveMsg(null);

    try {
      const upserts: Array<{ sectionId: number; rapNo: number; recordedOn: string }> = [];
      const deletes: Array<{ sectionId: number; rapNo: number; recordedOn: string }> = [];

      for (const day of week ?? []) {
        for (const t of day.tasks ?? []) {
          const k = keyOf(day.dateISO, t.id);
          const init = !!initialChecked[k];
          const cur = !!checked[k];

          if (t.sectionId <= 0 || t.rapNo <= 0) continue;

          if (!init && cur) {
            // 新規でチェック → 追加
            upserts.push({
              sectionId: t.sectionId,
              rapNo: t.rapNo,
              recordedOn: day.dateISO,
            });
          } else if (init && !cur) {
            // 取り消し → 削除
            deletes.push({
              sectionId: t.sectionId,
              rapNo: t.rapNo,
              recordedOn: day.dateISO,
            });
          }
        }
      }

      const fd = new FormData();
      fd.set("payload", JSON.stringify({ upserts, deletes }));

      const res = await saveAction(fd);
      if (!res.ok) {
        setSaveMsg(res.message ?? "保存に失敗しました。");
      } else {
        setSaveMsg("保存しました。");
        // 保存成功時、初期状態を更新（＝今の checked を initial とみなす）
        for (const day of week ?? []) {
          for (const t of day.tasks ?? []) {
            const k = keyOf(day.dateISO, t.id);
            initialChecked[k] = !!checked[k];
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存時にエラーが発生しました。"
      setSaveMsg(msg);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 2500);
    }
  }

  return (
    <>
      {/* 上部バー：トグル & 保存ボタン（同じスペースに常時表示／有効・無効切替） */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="rounded-lg border p-1 inline-flex">
            <Button
              type="button"
              variant={mode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("day")}
            >
              日
            </Button>
            <Button
              type="button"
              variant={mode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("week")}
            >
              週
            </Button>
          </div>

          {mode === "week" && weekRange && (
            <div className="text-sm text-muted-foreground">{weekRange}</div>
          )}

          <div className="flex items-center gap-2">
            {saveMsg ? (
              <div className="text-xs text-muted-foreground">{saveMsg}</div>
            ) : null}
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? "保存中…" : "保存"}
            </Button>
          </div>
        </div>
      </div>

      {/* データが無い場合の簡易表示（安全側） */}
      {visibleDays.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">本日のタスクはありません。</Card>
      ) : null}

      {visibleDays.map((day) => {
        const tasks = day.tasks ?? [];

        // その日が「タスクすべて完了」ならバッジ表示
        const allDone =
          tasks.length > 0 && tasks.every((t) => checked[keyOf(day.dateISO, t.id)]);

        // 教材でグルーピング
        const groups = groupByMaterial(day);

        return (
          <div key={day.dateISO} className="space-y-3 mb-6">
            {/* 日付ヘッダ（完了フラグは完了時のみ） */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatDayLocal(day.dateISO)}
              </Badge>
              {allDone && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  完了
                </Badge>
              )}
            </div>

            {/* タスクリスト（教材ごと1行、範囲は改行で複数表示） */}
            <Card className="overflow-auto">
              {/* ヘッダ */}
              <div
                className="grid bg-muted/40 text-muted-foreground text-xs font-medium"
                style={{ gridTemplateColumns: "56px 1.2fr 1fr" }}
              >
                <div className="px-3 py-2">完了</div>
                <div className="px-3 py-2">教材</div>
                <div className="px-3 py-2">範囲</div>
              </div>
              <Separator />

              {/* 行：教材グループごと */}
              <div className="divide-y">
                {groups.map((g) => {
                  const groupChecked = isGroupChecked(day.dateISO, g);
                  const unitLines = g.tasks.map((t) => t.unitLabel);

                  return (
                    <div
                      key={`${day.dateISO}:mat:${g.materialId}`}
                      className="grid items-center hover:bg-muted/20 transition-colors"
                      style={{ gridTemplateColumns: "56px 1.2fr 1fr" }}
                    >
                      {/* 一括チェック（当日の同一教材の全セクションに反映） */}
                      <div className="px-3 py-3 flex items-center">
                        <TaskDoneCheckbox
                          checked={groupChecked}
                          onCheckedChange={(v) => setGroupChecked(day.dateISO, g, Boolean(v))}
                        />
                      </div>

                      {/* 教材（リンク化） */}
                      <div className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl border bg-card text-card-foreground p-2">
                            <BookOpen className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              <Link href={`/material/${g.materialId}`}>
                                {g.material}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 範囲（複数行） */}
                      <div className="px-3 py-3">
                        <div className="text-sm whitespace-pre-line">
                          {unitLines.join("\n")}
                        </div>

                        {/* 個別の手動トグルも残しておく場合は下を使う（表示は不要なら削除可）
                        <div className="mt-2 grid gap-1">
                          {g.tasks.map((t) => {
                            const k = `${day.dateISO}:${t.id}`;
                            return (
                              <label key={k} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={!!checked[k]}
                                  onChange={(e) =>
                                    setChecked((s) => ({ ...s, [k]: e.target.checked }))
                                  }
                                />
                                <span>{t.unitLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                        */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      })}
    </>
  );
}
