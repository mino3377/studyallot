//C:\Users\chiso\nextjs\study-allot\src\lib\type\material.ts

import type { unit_type } from "@/lib/type/unit-type"

export type Material = {
  id: number
  slug: string
  project_id: number
  title: string
  order: number
  start_date: string
  end_date: string
  unit_type: unit_type
  unit_count: number
  rounds: number
  task_ratio_row:number[]
}

export type MaterialVM = Material& {
  rounds_now: number
  plannedPct: number
  actualPct: number
}