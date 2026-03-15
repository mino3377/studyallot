//C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\project-select.tsx

"use client"

import { useMemo, useState } from "react"
import ProjectSelectToggle from "@/components/project-select-toggle"
import { ProjectRow } from "@/lib/type/project_type"

export default function ProjectSelectHeader({
  projects,
  onSelectSlug,
  selectedSlug,
}: {
  projects: ProjectRow[]
  onSelectSlug: (slug: string) => void
  selectedSlug?: string
}) {
  const [open, setOpen] = useState(false)

  const selectedProjectIndex = useMemo(() => {
    if (!selectedSlug) return -1
    return projects.findIndex((p) => p.slug === selectedSlug)
  }, [projects, selectedSlug])

  const selectedProject = selectedProjectIndex >= 0 ? projects[selectedProjectIndex] : projects[0]

  const items = useMemo(
    () => projects.map((p) => ({ id: p.slug, label: p.name })),
    [projects]
  )

  return (
    <div className="relative bg-background/80 backdrop-blur">
      <ProjectSelectToggle
        items={items}
        selectedId={selectedProject.slug}
        open={open}
        onOpenChange={setOpen}
        onSelect={(slug) => onSelectSlug(slug)}
      />
    </div>
  )
}