// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[id]\edit\EditMaterialClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import BasicInfoCard, { type ProjectOption } from "@/components/materials/BasicInfoCard";
import SinglePlanEditor from "@/components/materials/SinglePlanEditor";
import SectionsEditor from "@/components/materials/SectionsEditor";

type Initial = {
  id: string;
  project_id: string;
  title: string;
  source_type: "book" | "video" | "paper" | "web" | "other";
  author: string;
  link: string;
  notes: string;
  start_date: string;
  end_date: string;
  total_units: number;
  rounds: number;
  section_titles: string[];
  section_ids: number[];
};

type ActionInput = Omit<Initial, "id">

export default function EditMaterialClient({
  action,
  projects,
  initial,
}: {
  action: (input: ActionInput) => Promise<void>;
  projects: ProjectOption[];
  initial: Initial;
}) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial.title);
  const [projectId, setProjectId] = useState(initial.project_id);
  const [typeValue, setTypeValue] = useState<Initial["source_type"]>(initial.source_type);
  const [author, setAuthor] = useState(initial.author);
  const [link, setLink] = useState(initial.link);
  const [notes, setNotes] = useState(initial.notes);

  const [fromDate, setFromDate] = useState(initial.start_date);
  const [toDate, setToDate] = useState(initial.end_date);
  const [totalUnits, setTotalUnits] = useState<number | "">(initial.total_units || "");
  const [lapsTotal, setLapsTotal] = useState<number | "">(initial.rounds || ""); // ★ 追加：これが無いと lapsTotal 未定義エラー

  // ここを追加（セクションの state 定義より少し上でOK）
  const initCount =
    typeof initial.total_units === "number" && initial.total_units > 0
      ? initial.total_units
      : 0;

  // ▼ 修正：Array.from の length に union を直接入れない
  const [sectionTitles, setSectionTitles] = useState<string[]>(
    initial.section_titles.length > 0
      ? [...initial.section_titles]
      : Array.from({ length: initCount }, (_, i) => `セクション${i + 1}`)
  );
  const [sectionIds, setSectionIds] = useState<number[]>(
    Array.isArray(initial.section_ids) ? [...initial.section_ids] : []
  );

  function setUnitsAndTitles(n: number | "") {
    setTotalUnits(n);
    if (n === "") {
      setSectionTitles([]);
      setSectionIds([]); // IDs も空に
      return;
    }
    const clamped = Math.max(1, Math.min(200, n));
    setSectionTitles((prev) => {
      const next = [...prev];
      if (next.length < clamped) {
        for (let i = next.length; i < clamped; i++) next.push(`セクション${i + 1}`);
      } else if (next.length > clamped) {
        next.length = clamped;
      }
      return next;
    });
    setSectionIds((prev) => {
      const next = [...prev];
      if (next.length < clamped) {
        // 新規に増えた位置のIDは 0（= 新規）で埋める
        for (let i = next.length; i < clamped; i++) next.push(0);
      } else if (next.length > clamped) {
        next.length = clamped;
      }
      return next;
    });
  }

  // 並び替え（1-based toIndex）。タイトルとIDを同時に動かす
  function onChangeSectionIndex(fromIndex0: number, toIndex1based: number) {
    const to = Math.max(1, Math.min((sectionTitles?.length ?? 0), toIndex1based)) - 1;
    setSectionTitles((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex0, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setSectionIds((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex0, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }

  // 行削除（複数対応）。タイトルとIDを同時に間引く
  function onBulkDeleteSections(indices: number[]) {
    if (indices.length === 0) return;
    const set = new Set(indices);
    setSectionTitles((prev) => prev.filter((_, i) => !set.has(i)));
    setSectionIds((prev) => prev.filter((_, i) => !set.has(i)));
    // 件数も揃える
    const newLen = Math.max(0, (sectionTitles.length - indices.length));
    setTotalUnits(newLen === 0 ? "" : newLen);
  }

  const selectedProject = useMemo<ProjectOption | null>(() => {
    return projects.find((p) => p.id === projectId) ?? null;
  }, [projects, projectId]);

  const todayISO = new Date().toISOString().slice(0, 10);

  function handleSubmit() {
    const payload: ActionInput = {
      title,
      source_type: typeValue,
      author: author,
      link: link,
      notes: notes,
      start_date: fromDate,
      end_date: toDate,
      total_units: typeof totalUnits === "number" ? totalUnits : 0,
      rounds: typeof lapsTotal === "number" ? lapsTotal : 1,
      project_id: projectId,
      section_titles: sectionTitles,
      section_ids: sectionIds,
    }
    startTransition(async () => {
      await action(payload);
    });
  }

  return (
    <form action={() => { }} className="space-y-6">
      <h1 className="text-2xl font-bold">マテリアルを編集</h1>

      <BasicInfoCard
        title={title}
        onChangeTitle={setTitle}
        projectId={projectId}
        onChangeProjectId={setProjectId}
        projects={projects}
        typeValue={typeValue}
        onChangeType={setTypeValue}
        author={author}
        onChangeAuthor={setAuthor}
        link={link}
        onChangeLink={setLink}
      />

      {/* メモ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">補足（任意）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">メモ</Label>
            <Textarea
              id="notes"
              placeholder="進め方、参考情報など"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* 単一プランエディタ */}
      <SinglePlanEditor
        startDate={fromDate}
        endDate={toDate}
        rounds={lapsTotal}
        onChangeStart={setFromDate}
        onChangeEnd={setToDate}
        onChangeRounds={setLapsTotal}
        dateLimit={{
          startMin: "2000-01-01",
          startMax: "2099-12-31",
          endMin: fromDate || todayISO,
          endMax: "2099-12-31",
        }}
      />

      {/* セクション（共通） */}
      <SectionsEditor
        totalUnits={totalUnits}
        onChangeTotalUnits={setUnitsAndTitles}
        sectionTitles={sectionTitles}
        onChangeSectionTitle={(i, v) =>
          setSectionTitles((prev) => {
            const next = [...prev];
            next[i] = v;
            return next;
          })
        }
        onReorder={onChangeSectionIndex}
        onBulkDelete={onBulkDeleteSections}
      />

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href={`/material/${initial.id}`}>キャンセル</Link>
        </Button>
        <Button
          type="button"
          className="px-6"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? "更新中…" : "更新する"}
        </Button>
      </div>
    </form>
  );
}
