export type Project = {
  id: number
  slug?: string
  title: string
  order?: number
}

export type ProjectIdString = {
  id: string
  slug?: string
  title: string
  order?: number
}

export type ProjectDetails = Project & {
  period: { from: string; to: string }
  daysLeftLabel: string
  materialsTotal: number
  actualPct: number
  plannedPct: number
}