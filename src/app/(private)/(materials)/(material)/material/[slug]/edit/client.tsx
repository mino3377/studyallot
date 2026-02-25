//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[id]\edit\client.tsx

"use client";

import { useMemo, useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BasicInfoCard from "@/components/new/material/BasicInfoCard";
import SectionsEditor from "@/components/new/material/SectionsEditor";
import PlanListEditor from "@/components/new/material/PlanListEditor";
import type { PlanVM, ProjectOption, MaterialEditInitial, UpdateMaterialInput } from "@/lib/type/material";

export default function EditMaterialClient({
  action,
  projects,
  initial,
  todayISO,
  timeZone
}: {
  action: (input: UpdateMaterialInput) => Promise<void>;
  projects: ProjectOption[];
  initial: MaterialEditInitial;
  todayISO: string;
  timeZone: string;
}) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial.title);
  const [projectId, setProjectId] = useState(initial.project_id);
  const [notes, setNotes] = useState(initial.notes);


  const [plans, setPlans] = useState<PlanVM[]>(
    initial.plans?.length
      ? initial.plans
      : [{
        id: "p-1",
        name: "プラン1",
        startDate: initial.start_date,
        endDate: initial.end_date,
        rounds: initial.rounds || "",
        isActive: true,
      }]
  );

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(() => {
    const idx = plans.findIndex(p => p.isActive);
    return idx >= 0 ? idx : 0;
  });

  const activePlan = plans[selectedPlanIndex] ?? plans[0];

  const [deletedPlanIds, setDeletedPlanIds] = useState<number[]>([]);


  const initCount =
    typeof initial.total_units === "number" && initial.total_units > 0
      ? initial.total_units
      : initial.section_titles.length;

  const [sectionTitles, setSectionTitles] = useState<string[]>(
    initial.section_titles.length > 0
      ? [...initial.section_titles]
      : Array.from({ length: initCount }, (_, i) => `セクション${i + 1}`)
  );

  const [sectionIds, setSectionIds] = useState<number[]>(
    Array.isArray(initial.section_ids) ? [...initial.section_ids] : []
  );

  function setUnitsAndTitles(n: number | "") {
    if (n === "") {
      setSectionTitles([]);
      setSectionIds([]);
      return;
    }
    const clamped = Math.max(1, Math.min(200, n));
    setSectionTitles((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push(`セクション${next.length + 1}`);
      if (next.length > clamped) next.length = clamped;
      return next;
    });
    setSectionIds((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push(0);
      if (next.length > clamped) next.length = clamped;
      return next;
    });
  }

  function onChangeSectionIndex(fromIndex0: number, toIndex1based: number) {
    const to = Math.max(1, Math.min(sectionTitles.length, toIndex1based)) - 1;
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

  function onBulkDeleteSections(indices: number[]) {
    if (!indices.length) return;
    const set = new Set(indices);
    setSectionTitles((prev) => prev.filter((_, i) => !set.has(i)));
    setSectionIds((prev) => prev.filter((_, i) => !set.has(i)));
  }

  const isoToDate = (iso: string) => new Date(`${iso}T00:00:00`);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addYears = (d: Date, n: number) => { const x = new Date(d); x.setFullYear(x.getFullYear() + n); return x; };

  const today = useMemo(() => isoToDate(todayISO), [todayISO]);
  const startMinDate = useMemo(() => fmt(addYears(today, -5)), [today]);
  const startMaxDate = useMemo(() => fmt(addYears(today, +5)), [today]);
  const endMinDate = useMemo(() => (activePlan?.startDate || startMinDate), [activePlan?.startDate, startMinDate]);
  const endMaxDate = startMaxDate;


  function onSelectPlan(i: number) {
    if (i < 0 || i >= plans.length) return;
    setSelectedPlanIndex(i);
  }

  function onAddPlan() {
    setPlans((prev) => {
      const idx = prev.length + 1;
      return [
        ...prev,
        {
          id: `tmp-${idx}`,
          name: `プラン${idx}`,
          startDate: activePlan?.startDate ?? "",
          endDate: activePlan?.endDate ?? "",
          rounds: activePlan?.rounds ?? "",
          isActive: false,
        },
      ];
    });
    setSelectedPlanIndex((prevIdx) => prevIdx + 1);
  }

  function onUpdatePlan(index: number, patch: Partial<PlanVM>) {
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function setOnlyOneActive(indexToActive: number | null) {
    setPlans((prev) => {
      if (indexToActive === null) return prev.map(p => ({ ...p, isActive: false }));
      return prev.map((p, i) => ({ ...p, isActive: i === indexToActive }));
    });
    if (indexToActive != null) setSelectedPlanIndex(indexToActive);
  }

  function onDeletePlan(index: number) {
    setPlans((prev) => {
      const target = prev[index];
      const asNum = Number(target?.id);
      if (!Number.isNaN(asNum) && Number.isFinite(asNum)) {
        setDeletedPlanIds((old) => Array.from(new Set([...old, asNum])));
      }
      const next = [...prev];
      next.splice(index, 1);
      if (next.length === 0) {
        next.push({
          id: "tmp-1",
          name: "プラン1",
          startDate: "",
          endDate: "",
          rounds: 1,
          isActive: true,
        });
        setSelectedPlanIndex(0);
        return next;
      }
      const newIdx = Math.min(index, next.length - 1);
      setSelectedPlanIndex(newIdx);
      if (!next.some(p => p.isActive)) {
        next[newIdx].isActive = true;
      }
      return next;
    });
  }

  function handleSubmit() {
    const rep = plans.find(p => p.isActive) ?? plans[0];

    const payload: UpdateMaterialInput = {
      title,
      notes,
      start_date: rep?.startDate ?? "",
      end_date: rep?.endDate ?? "",
      total_units: sectionTitles.length,
      rounds: typeof rep?.rounds === "number" ? rep.rounds : 1,
      project_id: projectId,
      section_titles: sectionTitles,
      section_ids: sectionIds,
      plans,
      deleted_plan_ids: deletedPlanIds.length ? deletedPlanIds : undefined,
    };

    startTransition(async () => {
      await action(payload);
    });
  }

  return (
    <form action={() => { }} className="space-y-6">

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
        startMinDate={startMinDate}
        startMaxDate={startMaxDate}
        endMinDate={endMinDate}
        endMaxDate={endMaxDate}
        plans={plans}
        selectedPlanIndex={selectedPlanIndex}
        onSelectPlan={onSelectPlan}
        onAddPlan={onAddPlan}
        onUpdatePlan={onUpdatePlan}
        setOnlyOneActive={setOnlyOneActive}
        onDeletePlan={onDeletePlan}
        totalUnits={sectionTitles.length}
        timeZone={timeZone}
      />

      <SectionsEditor
        totalUnits={sectionTitles.length}
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
        <Button type="button" className="px-6" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "更新中…" : "更新する"}
        </Button>
      </div>
    </form>
  );
}
