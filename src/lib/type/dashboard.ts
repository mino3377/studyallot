
//各教材の情報
export type GanttItem = {
  id: number
  title: string
  start: string
  end: string
  projectSlug: string
  projectName: string
}

export type ViewMode = "year" | "month"