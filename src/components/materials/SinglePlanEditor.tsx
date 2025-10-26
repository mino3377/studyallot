// src/components/materials/SinglePlanEditor.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar29 } from "@/components/input-calender"; // ★実体のファイル名の綴りに注意
import type { SinglePlanProps } from "@/lib/type/material";

export default function SinglePlanEditor({
  startDate, endDate, rounds,
  onChangeStart, onChangeEnd, onChangeRounds,
  dateLimit,
}: SinglePlanProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">スケジュール設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Calendar29
              id="fromDate"
              label="開始日"
              value={startDate}
              minISO={dateLimit.startMin}
              maxISO={dateLimit.startMax}
              onChange={(iso) => {
                onChangeStart(iso);
                if (endDate && new Date(endDate) < new Date(iso)) {
                  onChangeEnd(iso);
                }
              }}
              placeholder=""
            />
          </div>

          <div className="space-y-2">
            <Calendar29
              id="toDate"
              label="終了日"
              value={endDate}
              minISO={dateLimit.endMin}
              maxISO={dateLimit.endMax}
              onChange={(iso) => onChangeEnd(iso)}
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
              value={rounds}
              onChange={(e) => {
                const v = e.target.value === "" ? "" : Number(e.target.value);
                if (v === "") onChangeRounds("");
                else onChangeRounds(Math.max(1, Math.min(100, v)));
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
