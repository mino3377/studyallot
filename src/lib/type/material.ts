//C:\Users\chiso\nextjs\study-allot\src\lib\type\material.ts

import type { UnitType } from "@/lib/type/unit-type"

export type ProjectOption = { id: string; name: string }

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
  unitType: UnitType
  unitCount: number
  rounds: number
  planDays: number[]
}

export type MaterialRow = {
  id: number
  slug: string
  project_id: number
  title: string
  order: number | null
  start_date: string | null
  end_date: string | null
  unit_type: string | null
  unit_count: number | null
  rounds: number | null
  plan_days: number[] | null
  actual_days: number[] | null
}

export type PopupMaterialForMaterialPage = {
  id: number | string
  slug: string
  title: string
  projectSlug?: string
  startDate?: string
  endDate?: string
  totalUnits?: number
  lapsTotal?: number
  planDays?: number[]
  actualDays?: number[]
  unitType?: UnitType
  unitLabel?: string
}
