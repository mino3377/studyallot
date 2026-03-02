//C:\Users\chiso\nextjs\study-allot\src\lib\type\material.ts

export type ProjectOption = { id: string; name: string }

export type PlanVM = {
  id: string
  name: string
  startDate: string
  endDate: string
  rounds: number | ""
  isActive: boolean
}

export type MaterialEditInitial = {
  id: string
  project_id: string
  title: string
  start_date: string
  end_date: string
  total_units: number
  rounds: number
  section_titles: string[]
  section_ids: number[]
  plans: PlanVM[]
}

export type PlanListEditorProps = {
  startMinDate?: string
  startMaxDate?: string
  endMinDate?: string
  endMaxDate?: string
  totalUnits: number | ""
  plans: PlanVM[]
  selectedPlanIndex: number

  onSelectPlan: (i: number) => void
  onAddPlan: () => void
  onUpdatePlan: (index: number, patch: Partial<PlanVM>) => void
  setOnlyOneActive: (indexToActive: number | null) => void
  onDeletePlan: (index: number) => void
}

export type MaterialInfoProps = {
  title: string
  onChangeTitle: (v: string) => void
  projectId: string
  onChangeProjectId: (v: string) => void
  projects: ProjectOption[]
}

export type CreateMaterialInput = {
  title: string
  total_units: number
  project_id: string
  section_titles: string[]
  plans: {
    name: string
    start_date: string
    end_date: string
    rounds: number
    is_active: boolean
  }[]
}

export type SectionsEditorProps = {
  totalUnits: number | ""
  onChangeTotalUnits: (v: number | "") => void
  sectionTitles: string[]
  onChangeSectionTitle: (index: number, v: string) => void
  onReorder: (fromIndex0: number, toIndex1based: number) => void
  onBulkDelete?: (indices: number[]) => void
  max?: number
}

// ★ここから追加（統一型）
export type UnitType = "section" | "chapter" | "unit" | "page"

export type MaterialVM = {
  id: number | string
  title: string
  slug: string
  order: number
  startDate: string
  endDate: string
  totalUnits: number
  lapsNow: number
  lapsTotal: number
  plannedPct: number
  actualPct: number
  planDays?: number[]
  actualDays?: number[]
  unitType: UnitType
  // unitLabel は DBにあれば使う、無ければ unitType から導出でOK
  unitLabel?: string
}

export type UpdateMaterialInput = {
  slug: string
  projectMode: "existing" | "new"
  selectedProjectId?: string
  newProjectName?: string

  title: string
  startDate: string
  endDate: string
  unitType: UnitType // ★ string から UnitType へ
  unitCount: number
  rounds: number
  planDays: number[]
}