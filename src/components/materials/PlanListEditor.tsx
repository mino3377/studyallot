// src/components/materials/PlanListEditor.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers } from "lucide-react";
import { Calendar29 } from "@/components/input-calender"; // ★スペル注意: 実体と一致させてください
import type { PlanProps } from "@/lib/type/material";

export default function PlanListEditor(props: PlanProps) {
  const {
    startMinDate, startMaxDate, endMinDate, endMaxDate,
    plans, selectedPlanIndex, onSelectPlan, onAddPlan, onUpdatePlan, setOnlyOneActive,
  } = props;

  const current = plans[selectedPlanIndex];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">スケジュール設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* プラン選択バー */}
        <div className="flex flex-wrap items-center gap-2">
          {plans.map((p, i) => {
            const active = i === selectedPlanIndex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlan(i)}
                className={`px-3 py-1 rounded-full border text-sm ${active ? "bg-primary text-primary-foreground" : "bg-background"}`}
                title={p.name}
              >
                {p.name}{p.isActive ? " ★" : ""}
              </button>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={onAddPlan}>
            <Plus className="h-4 w-4 mr-1" /> 追加
          </Button>
        </div>

        {/* 選択中プランの編集 */}
        {current && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planName">プラン名</Label>
              <Input
                id="planName"
                value={current.name}
                onChange={(e) => onUpdatePlan(selectedPlanIndex, { name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>アクティブ（同時に1つまで）</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={current.isActive}
                  onCheckedChange={(v) => {
                    if (v) setOnlyOneActive(selectedPlanIndex);
                    else setOnlyOneActive(null);
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  ※ ひとつ以上ONで保存しても、保存時に1つだけONになるよう正規化します
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Calendar29
                id="fromDate"
                label="開始日"
                value={current.startDate}
                minISO={startMinDate}
                maxISO={startMaxDate}
                onChange={(iso) => {
                  onUpdatePlan(selectedPlanIndex, { startDate: iso });
                  if (current.endDate && new Date(current.endDate) < new Date(iso)) {
                    onUpdatePlan(selectedPlanIndex, { endDate: iso });
                  }
                }}
                placeholder=""
              />
            </div>

            <div className="space-y-2">
              <Calendar29
                id="toDate"
                label="終了日"
                value={current.endDate}
                minISO={endMinDate}
                maxISO={endMaxDate}
                onChange={(iso) => onUpdatePlan(selectedPlanIndex, { endDate: iso })}
                placeholder=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="laps">周回数（最大100）</Label>
              <Input
                id="laps"
                type="number"
                min={1}
                max={100}
                value={current.rounds}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Number(e.target.value);
                  if (v === "") onUpdatePlan(selectedPlanIndex, { rounds: "" });
                  else onUpdatePlan(selectedPlanIndex, { rounds: Math.max(1, Math.min(100, v)) });
                }}
              />
            </div>
          </div>
        )}

        {/* デモ（表示のみの箱。中身は既存を流用したい場合に追加） */}
        <Card className="border border-dashed">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              ペース計算機
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">保存されません</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            （必要なら既存のデモUIをここに移植）
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
