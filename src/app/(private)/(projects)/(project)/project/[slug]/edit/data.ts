// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\edit\data.ts
import { cache } from "react"
import { fetchProjectForEdit } from "./queries"

export type EditProjectInitial = {
  slug: string
  name: string
}

export type EditProjectData = {
  projectId: number
  initial: EditProjectInitial
}

export const loadEditProjectData = cache(async (userId: string, slug: string): Promise<EditProjectData | null> => {
  const row = await fetchProjectForEdit(slug, userId)
  if (!row) return null

  return {
    projectId: row.id,
    initial: {
      slug: row.slug,
      name: row.name ?? "",
    },
  }
})

export function preloadEditProjectData(userId: string, slug: string) {
  void loadEditProjectData(userId, slug)
}
