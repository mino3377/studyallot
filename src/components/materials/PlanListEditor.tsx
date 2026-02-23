// src/components/materials/PlanListEditor.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Calendar29 } from "@/components/input-calender";
import type { PlanListEditorProps as PlanProps } from "@/lib/type/material";
import { calcPlanPace } from "./CalcPlanPace";

export default function PlanListEditor(
  props: PlanProps & { timeZone: string }
) {
  const {
    timeZone,
    startMinDate, startMaxDate, endMinDate, endMaxDate,
    plans, selectedPlanIndex, onSelectPlan, onAddPlan, onUpdatePlan, setOnlyOneActive,
    onDeletePlan, totalUnits
  } = props;

  const current = plans[selectedPlanIndex];

  const pace = calcPlanPace({
    startISO: current?.startDate,
    endISO: current?.endDate,
    totalUnits: typeof totalUnits === "number" ? totalUnits : undefined,
    rounds: typeof current?.rounds === "number" ? current.rounds : undefined,
  });



  const MAX_PLANS = 3;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">スケジュール設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {plans.map((p, i) => {
            const active = i === selectedPlanIndex;
            return (
              <div key={p.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectPlan(i)}
                  className={`px-3 py-1 rounded-full border text-sm ${active ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  title={p.name}
                >
                  {p.name}{p.isActive ? " ★" : ""}
                </button>
              </div>
            );
          })}
          <Button type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (plans.length >= MAX_PLANS) return;
              onAddPlan();
            }}
            disabled={plans.length >= MAX_PLANS}
          >
            <Plus className="h-4 w-4 mr-1" /> 追加
          </Button>
        </div>

        {current && (
          <div>
            <div className="grid grid-cols-3 items-center mb-4">
              <div className="col-span-2 space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="planName">プラン名</Label>
                    <Input
                      id="planName"
                      value={current.name}
                      onChange={(e) => onUpdatePlan(selectedPlanIndex, { name: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="hover:bg-gray-100"
                    size="icon"
                    onClick={() => onDeletePlan(selectedPlanIndex)}
                    title="プランを削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="col-span-1 mx-auto flex gap-1 self-end mb-3">
                <Label>アクティブ</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={current.isActive}
                    onCheckedChange={(v) => {
                      if (!v) return;
                      setOnlyOneActive(selectedPlanIndex);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 items-center">
              <div className="space-y-2">
                <Calendar29
                  timeZone={timeZone}
                  id="fromDate"
                  label="開始日"
                  value={current.startDate}
                  minISO={startMinDate}
                  maxISO={startMaxDate}
                  onChange={(iso) => {
                    onUpdatePlan(selectedPlanIndex, { startDate: iso });
                    if (current.endDate && current.endDate < iso) {
                      onUpdatePlan(selectedPlanIndex, { endDate: iso });
                    }
                  }}
                  placeholder=""
                />
              </div>

              <div className="space-y-2">
                <Calendar29
                  timeZone={timeZone}
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
          </div>

        )}

        <div className="space-y-2">
          <Label className="text-sm">ペース計算</Label>
          <Card className="px-0 py-3 border border-dashed">
            <CardContent className="text-sm text-muted-foreground">
              {!pace.ok ? (
                <div>{pace.message}</div>
              ) : (
                <div className="space-y-1">
                  <div>期間：{pace.days}日</div>
                  <div>1日：{pace.perDay.toFixed(1)} セクション</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
