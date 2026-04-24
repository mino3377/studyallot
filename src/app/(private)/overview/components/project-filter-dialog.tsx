"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Project } from "@/lib/type/project_type"

type Props = {
  projectRow: Project[]
  selectedProjectSlug: string | "all"
  onSelect: (projectSlug: string | "all") => void
}

export function ProjectFilterDialog({
  projectRow,
  selectedProjectSlug,
  onSelect,
}: Props) {
  const selectedProjectTitle =
    selectedProjectSlug === "all"
      ? "All"
      : projectRow.find((project) => project.slug === selectedProjectSlug)?.title ?? "All"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 border-black/20 rounded-sm text-black hover:opacity-80"
        >
          {selectedProjectTitle}
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-none border-black sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>フィルター設定</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className={`justify-start rounded-none ${
              selectedProjectSlug === "all"
                ? "border-black bg-black text-white hover:bg-black hover:text-white rounded-md"
                : "border-black/20"
            }`}
            onClick={() => onSelect("all")}
          >
            All
          </Button>

          {projectRow.map((project) => (
            <Button
              key={project.id}
              type="button"
              variant="outline"
              className={`justify-start rounded-md ${
                selectedProjectSlug === project.slug
                  ? "border-black bg-black text-white hover:bg-black hover:text-white "
                  : "border-black/20"
              }`}
              onClick={() => onSelect(project.slug ?? "all")}
            >
              {project.title}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}