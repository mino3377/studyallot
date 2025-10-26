// C:\Users\chiso\nextjs\study-allot\src\app\(private)\add-textbook\AddTextbookClient.tsx
"use client";

import { useMemo, useState, FormEvent, useTransition, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BasicInfoCard from "@/components/materials/BasicInfoCard";
import PlanListEditor from "@/components/materials/PlanListEditor";
import SectionsEditor from "@/components/materials/SectionsEditor";
import { AddTextBookProps, PlanVM } from "@/lib/type/material";

export default function AddTextbookClient({ action, projects }: AddTextBookProps) {
  // 基本情報
  const [title, setTitle] = useState("");
  const [typeValue, setTypeValue] = useState<"book" | "video" | "paper" | "web" | "other">("book");
  const [author, setAuthor] = useState("");
  const [link, setLink] = useState("");
  const [projectId, setProjectId] = useState<string>("");

  // セクション（プラン共通）
  const [totalSections, setTotalSections] = useState<number | "">("");
  const [sectionTitles, setSectionTitles] = useState<string[]>([]);

  // メモ
  const [notes, setNotes] = useState("");

  // デモ（任意）
  const [demoUnitsPerDay, setDemoUnitsPerDay] = useState<number | "">("");

  // 日付ユーティリティ
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  
  const oneYearLater = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [today]);

  const selectedProject = useMemo(() => projects.find((p) => p.id === projectId) || null, [projects, projectId]);

  // 期間選択範囲（UI制約）
  const startMinDate = useMemo(() => fmt(new Date(today)), [today]);
  const startMaxDate = useMemo(() => fmt(new Date(oneYearLater)), [oneYearLater]);
  const endMinDate = startMinDate;
  const endMaxDate = startMaxDate;

  // セクション数が変わる → タイトル数調整（上限200）
  useEffect(() => {
    const n = typeof totalSections === "number" ? Math.max(0, Math.min(200, totalSections)) : 0;
    setSectionTitles((prev) => {
      if (n <= 0) return [];
      if (prev.length === n) return prev;
      if (prev.length < n) {
        return [...prev, ...Array.from({ length: n - prev.length }, () => "")];
      }
      return prev.slice(0, n);
    });
  }, [totalSections]);

  function onChangeSectionTitle(index: number, value: string) {
    setSectionTitles((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function onChangeSectionIndex(fromIndex: number, toIndex1based: number) {
    setSectionTitles((prev) => {
      const next = [...prev];
      const item = next[fromIndex];
      next.splice(fromIndex, 1);
      const to = Math.max(0, Math.min(next.length, toIndex1based - 1));
      next.splice(to, 0, item);
      return next;
    });
  }

  function onBulkDeleteSections(indices: number[]) {
    if (indices.length === 0) return;
    const set = new Set(indices);
    setSectionTitles((prev) => {
      const next = prev.filter((_, i) => !set.has(i));
      setTotalSections(next.length === 0 ? "" : next.length);
      return next;
    });
  }

  // プラン（複数）
  const [plans, setPlans] = useState<PlanVM[]>([{
    id: "p-1",
    name: "プラン1",
    startDate: "",
    endDate: "",
    rounds: "",
    isActive: true,
  }]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  function addPlan() {
    setPlans(prev => {
      const idx = prev.length + 1;
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          id: `p-${idx}`,
          name: `プラン${idx}`,
          startDate: last?.startDate ?? "",
          endDate: last?.endDate ?? "",
          rounds: last?.rounds ?? "",
          isActive: false,
        }
      ];
    });
    setSelectedPlanIndex(plans.length);
  }

  function updatePlan(index: number, patch: Partial<PlanVM>) {
    setPlans(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function setOnlyOneActive(indexToActive: number | null) {
    setPlans(prev => {
      if (indexToActive === null) {
        return prev.map(p => ({ ...p, isActive: false }));
      }
      return prev.map((p, i) => ({ ...p, isActive: i === indexToActive }));
    });
  }

  // 送信
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const ts = typeof totalSections === "number" ? totalSections : 0;
    if (!title || !projectId || ts <= 0) {
      alert("必須項目（マテリアル名・プロジェクト・総セクション数）を入力してください。");
      return;
    }
    if (plans.length === 0) {
      alert("少なくとも1つのプランが必要です。");
      return;
    }
    for (const p of plans) {
      if (!p.name || !p.startDate || !p.endDate || !p.rounds || Number(p.rounds) <= 0) {
        alert("各プランの『名前／開始日／終了日／周回数』を入力してください。");
        return;
      }
      if (new Date(p.startDate) > new Date(p.endDate)) {
        alert(`プラン「${p.name}」の開始日と終了日を確認してください。`);
        return;
      }
    }

    const payload = {
      title,
      source_type: typeValue,
      author: author || null,
      link: link || null,
      notes: notes || null,
      total_units: ts,
      project_id: projectId,
      section_titles: sectionTitles,
      plans: plans.map(p => ({
        name: p.name,
        start_date: p.startDate,
        end_date: p.endDate,
        rounds: Number(p.rounds),
        is_active: Boolean(p.isActive),
      })),
    };

    startTransition(async () => {
      try {
        await action(payload);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "作成に失敗しました。入力内容をご確認ください。"
        alert(msg)
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* スケジュール（複数プラン） */}
      <PlanListEditor
        startMinDate={startMinDate}
        startMaxDate={startMaxDate}
        endMinDate={endMinDate}
        endMaxDate={endMaxDate}
        selectedProject={selectedProject}
        plans={plans}
        selectedPlanIndex={selectedPlanIndex}
        onSelectPlan={setSelectedPlanIndex}
        onAddPlan={addPlan}
        onUpdatePlan={updatePlan}
        setOnlyOneActive={setOnlyOneActive}
        // 以下2つは使わないのでダミー（Sectionsは別カードで扱う）
        totalUnits={0}
        onChangeTotalUnits={() => {}}
        sectionTitles={[]}
        onChangeSectionTitle={() => {}}
        onChangeSectionIndex={() => {}}
        onBulkDeleteSections={() => {}}
        demoUnitsPerDay={demoUnitsPerDay}
        onChangeDemoUnitsPerDay={setDemoUnitsPerDay}
      />

      {/* セクション（共通） */}
      <SectionsEditor
        totalUnits={totalSections}
        onChangeTotalUnits={setTotalSections}
        sectionTitles={sectionTitles}
        onChangeSectionTitle={onChangeSectionTitle}
        onReorder={onChangeSectionIndex}
        onBulkDelete={onBulkDeleteSections}
        max={200}
      />

      {/* メモ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">補足メモ（任意）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="notes">メモ</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost"><Link href="/project">キャンセル</Link></Button>
        <Button type="submit" className="px-6" disabled={isPending}>
          {isPending ? "作成中..." : "作成する"}
        </Button>
      </div>
    </form>
  );
}
