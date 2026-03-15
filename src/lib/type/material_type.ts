//C:\Users\chiso\nextjs\study-allot\src\lib\type\material.ts

import type { unit_type } from "@/lib/type/unit-type"

export type ProjectOption = { id: string; name: string }

export type MaterialRegisterValue = {
  title: string
  start_date?: string
  end_date?: string
  unit_type: unit_type
  unit_count: number
  rounds: number
}

export type MaterialRow = {
  id?: number
  slug: string
  project_id: number
  title: string
  order?: number
  start_date: string
  end_date: string
  unit_type: unit_type
  unit_count: number
  rounds: number
  plan_days: number[]
  actual_days?: number[]
}

export type MaterialVM = MaterialRow & {
  rounds_now: number
  plannedPct: number
  actualPct: number
}

export type UpdateMaterialInput ={
  projectMode: "existing" | "new"
  selectedProjectId?: number
  newProjectName?: string
}


