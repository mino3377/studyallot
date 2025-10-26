// src/lib/type/material.ts

// ========== 共通で使う型 ==========
export type ProjectOption = { id: string; name: string };

// ---------- 新規作成用 ----------
export type PlanVM = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  rounds: number | "";
  isActive: boolean;
};

export type PlanProps = {
  // 期間のUI制約
  startMinDate: string;
  startMaxDate: string;
  endMinDate: string;
  endMaxDate: string;
  selectedProject: ProjectOption | null;

  // プランUI
  plans: PlanVM[];
  selectedPlanIndex: number;
  onSelectPlan: (i: number) => void;
  onAddPlan: () => void;
  onUpdatePlan: (index: number, patch: Partial<PlanVM>) => void;
  setOnlyOneActive: (indexToActive: number | null) => void;

  // セクション（共通）
  totalUnits: number | "";
  onChangeTotalUnits: (v: number | "") => void;
  sectionTitles: string[];
  onChangeSectionTitle: (index: number, value: string) => void;
  onChangeSectionIndex: (fromIndex: number, toIndex1based: number) => void;
  onBulkDeleteSections: (indices: number[]) => void;

  // デモ
  demoUnitsPerDay: number | "";
  onChangeDemoUnitsPerDay: (v: number | "") => void;
};

export type MaterialInfoProps = {
  title: string;
  onChangeTitle: (v: string) => void;

  projectId: string;
  onChangeProjectId: (v: string) => void;
  projects: ProjectOption[];

  typeValue: "book" | "video" | "paper" | "web" | "other";
  onChangeType: (v: "book" | "video" | "paper" | "web" | "other") => void;

  author: string;
  onChangeAuthor: (v: string) => void;

  link: string;
  onChangeLink: (v: string) => void;
};

export type AddTextBookProps = {
  action: (payload: any) => Promise<void>;
  projects: ProjectOption[];
};

// ---------- 編集用（単一プランUI） ----------
export type SinglePlanProps = {
  startDate: string;
  endDate: string;
  rounds: number | "";
  onChangeStart: (iso: string) => void;
  onChangeEnd: (iso: string) => void;
  onChangeRounds: (v: number | "") => void;

  dateLimit: {
    startMin: string;
    startMax: string;
    endMin: string;
    endMax: string;
  };
};

export type SectionsEditorProps = {
  totalUnits: number | "";
  onChangeTotalUnits: (v: number | "") => void;
  sectionTitles: string[];
  onChangeSectionTitle: (index: number, v: string) => void;
  onReorder: (fromIndex0: number, toIndex1based: number) => void;
  onBulkDelete?: (indices: number[]) => void;
  max?: number; // default 200
};
