export type ProjectRow = {
  id: number
  slug: string
  name: string
  order: number
}

export type ProjectForProjectPage = {
  id: number | string
  slug: string
  name: string
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  actualPct: number
  plannedPct: number
}