// src/app/(private)/new-material/page-body.tsx
"use client";

import { useMemo, useState, FormEvent, useTransition, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BasicInfoCard from "@/components/materials/BasicInfoCard";
import PlanListEditor from "@/components/materials/PlanListEditor";
import SectionsEditor from "@/components/materials/SectionsEditor";
import type { ProjectOption, PlanVM } from "@/lib/type/material";

type Props = {
  action: (input: unknown) => Promise<void>;
  projects: ProjectOption[];
  tz: string;
  todayISO: string;
};

function addYearsISO(iso: string, years: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCFullYear(d.getUTCFullYear() + years);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NewMaterialClient({ action, projects, tz, todayISO }: Props) {
  const [title, setTitle] = useState("");

  const [projectId, setProjectId] = useState<string>("");

  const [totalSections, setTotalSections] = useState<number | "">("");
  const [sectionTitles, setSectionTitles] = useState<string[]>([]);

  const [notes, setNotes] = useState("");

  const [plans, setPlans] = useState<PlanVM[]>([
    {
      id: "p-1",
      name: "プラン1",
      startDate: todayISO,
      endDate: todayISO,
      rounds: "",
      isActive: true,
    },
  ]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const activePlan = plans[selectedPlanIndex];
  const startMinDate = useMemo(() => addYearsISO(todayISO, -5), [todayISO]);
  const startMaxDate = useMemo(() => addYearsISO(todayISO, +5), [todayISO]);
  const endMinDate = useMemo(
    () => activePlan?.startDate || startMinDate,
    [activePlan?.startDate, startMinDate]
  );
  const endMaxDate = startMaxDate;

  useEffect(() => {
    const n =
      typeof totalSections === "number"
        ? Math.max(0, Math.min(200, totalSections))
        : 0;
    setSectionTitles((prev) => {
      if (n <= 0) return [];
      if (prev.length === n) return prev;
      if (prev.length < n) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, () => ""),
        ];
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

  function addPlan() {
    setPlans((prev) => {
      const idx = prev.length + 1;
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          id: `p-${idx}`,
          name: `プラン${idx}`,
          startDate: last?.startDate ?? todayISO,
          endDate: last?.endDate ?? todayISO,
          rounds: last?.rounds ?? "",
          isActive: false,
        },
      ];
    });
    setSelectedPlanIndex((i) => i + 1);
  }

  function updatePlan(index: number, patch: Partial<PlanVM>) {
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function setOnlyOneActive(indexToActive: number | null) {
    setPlans((prev) => {
      if (indexToActive === null) return prev.map((p) => ({ ...p, isActive: false }));
      return prev.map((p, i) => ({ ...p, isActive: i === indexToActive }));
    });
  }

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const ts = typeof totalSections === "number" ? totalSections : 0;
    if (!title || !projectId || ts <= 0) {
      alert("必須項目（教材名・プロジェクト名・セクション数）を入力してください。");
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
      if (p.startDate > p.endDate) {
        alert(`プラン「${p.name}」の開始日と終了日を確認してください。`);
        return;
      }
    }

    const payload = {
      title,
      notes: notes || null,
      total_units: ts,
      project_id: projectId,
      section_titles: sectionTitles,
      plans: plans.map((p) => ({
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
        const msg =
          err instanceof Error
            ? err.message
            : "作成に失敗しました。入力内容をご確認ください。";
        alert(msg);
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
        notes={notes}
        onChangeNotes={setNotes}
      />

      <PlanListEditor
        timeZone={tz}
        startMinDate={startMinDate}
        startMaxDate={startMaxDate}
        endMinDate={endMinDate}
        endMaxDate={endMaxDate}
        plans={plans}
        totalUnits={totalSections}
        selectedPlanIndex={selectedPlanIndex}
        onSelectPlan={(i: number) => setSelectedPlanIndex(i)}
        onAddPlan={addPlan}
        onUpdatePlan={updatePlan}
        setOnlyOneActive={setOnlyOneActive}
        onDeletePlan={(i: number) => {
          setPlans((prev) => prev.filter((_, idx) => idx !== i));
          setSelectedPlanIndex((i2) => Math.max(0, Math.min(i2, plans.length - 2)));
        }}
      />

      <SectionsEditor
        totalUnits={totalSections}
        onChangeTotalUnits={setTotalSections}
        sectionTitles={sectionTitles}
        onChangeSectionTitle={onChangeSectionTitle}
        onReorder={onChangeSectionIndex}
        onBulkDelete={onBulkDeleteSections}
        max={100}
      />

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/project">キャンセル</Link>
        </Button>
        <Button type="submit" className="md:px-6" disabled={isPending}>
          {isPending ? "作成中..." : "作成する"}
        </Button>
      </div>
    </form>
  );
}
