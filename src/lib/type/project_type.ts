export type ProjectRow = {
  id: number
  slug?: string
  name: string
  order?: number
}

export type ProjectDetails = ProjectRow & {
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  actualPct: number
  plannedPct: number
}