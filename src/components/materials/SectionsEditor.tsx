// src/components/materials/SectionsEditor.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import type { SectionsEditorProps } from "@/lib/type/material";

export default function SectionsEditor({
  totalUnits,
  onChangeTotalUnits,
  sectionTitles,
  onChangeSectionTitle,
  onReorder,
  onBulkDelete,
  max = 200,
}: SectionsEditorProps) {
  const unitCount =
    typeof totalUnits === "number" ? Math.min(Math.max(totalUnits, 0), max) : 0;
  const show = unitCount > 0;

  // 選択削除（既存のAPIはそのまま）
  const selected = new Set<number>();
  function toggle(i: number, v: boolean) {
    if (v) selected.add(i);
    else selected.delete(i);
  }
  function bulkDelete() {
    if (!onBulkDelete) return;
    onBulkDelete(Array.from(selected));
    selected.clear();
  }

  // 番号入力は確定（Enter/Blur）でのみリオーダー
  const [orderInputs, setOrderInputs] = useState<Array<number | "">>([]);
  useEffect(() => {
    setOrderInputs(Array.from({ length: unitCount }, (_, i) => i + 1));
  }, [unitCount, sectionTitles]);

  function setOrderInput(i: number, v: number | "") {
    setOrderInputs((prev) => {
      const next = [...prev];
      next[i] = v === "" ? "" : Number(v);
      return next;
    });
  }

  function commitReorder(i: number) {
    const raw = orderInputs[i];
    const to = Number(raw);
    if (Number.isInteger(to) && to >= 1 && to <= unitCount && to !== i + 1) {
      onReorder(i, to);
    }
  }
  function deleteOne(i: number) {
    if (!onBulkDelete) return;
    onBulkDelete([i]);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">セクション設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="totalUnits">総セクション数（最大{max}）</Label>
            <Input
              id="totalUnits"
              type="number"
              min={1}
              max={max}
              value={totalUnits}
              onChange={(e) => {
                const v = e.target.value === "" ? "" : Number(e.target.value);
                if (v === "") onChangeTotalUnits("");
                else onChangeTotalUnits(Math.max(1, Math.min(max, v)));
              }}
            />
          </div>
        </div>

        {show && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>各セクションの設定（番号は Enter/Blur で確定）</Label>
              {onBulkDelete && (
                <Button type="button" variant="outline" size="sm" onClick={bulkDelete}>
                  選択削除
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {Array.from({ length: unitCount }).map((_, i) => (
                <div
                  key={i}
                  className="grid gap-2 md:grid-cols-[40px_120px_1fr_auto]"
                >
                  <div className="flex items-center justify-center">
                    {onBulkDelete ? (
                      <Checkbox
                        onCheckedChange={(v) => toggle(i, Boolean(v))}
                        aria-label={`セクション${i + 1}を選択`}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`section-order-${i + 1}`} className="whitespace-nowrap">
                      番号
                    </Label>
                    <Input
                      id={`section-order-${i + 1}`}
                      type="number"
                      min={1}
                      max={unitCount}
                      value={orderInputs[i] ?? ""}
                      onChange={(e) => {
                        const v: number | "" = e.currentTarget.value === "" ? "" : Number(e.currentTarget.value);
                        setOrderInput(i, v);
                      }}

                      onBlur={() => commitReorder(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur(); // blurで確定処理を統一
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`section-title-${i + 1}`} className="whitespace-nowrap">
                      タイトル
                    </Label>
                    <Input
                      id={`section-title-${i + 1}`}
                      value={sectionTitles[i] ?? ""}
                      onChange={(e) => onChangeSectionTitle(i, e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      className="bg-white hover:bg-gray-100"
                      size="icon"
                      onClick={() => deleteOne(i)}
                      aria-label={`セクション${i + 1}を削除`}
                    >
                      <Trash2 className="h-4 w-4 text-black hover:" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
