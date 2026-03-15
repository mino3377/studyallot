"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ProjectSelectToggle, { type SelectToggleItem } from "@/components/project-select-toggle"

export type ProjectOption = {
  id: string
  name: string
}

export type ProjectSelectStepValue = {
  mode: "existing" | "new"
  selectedProjectId?: string
  newProjectName?: string
}

type Props = {
  projects?: ProjectOption[]
  value?: ProjectSelectStepValue
  onChange?: (next: ProjectSelectStepValue) => void
  onNext?: () => void
}

export default function ProjectSelectStep({
  projects = [],
  value = { mode: "existing", selectedProjectId: "", newProjectName: "" },
  onChange,
  onNext,
}: Props) {
  const [open, setOpen] = React.useState(false)

  const hasProjects = projects.length > 0
  const mode: "existing" | "new" = hasProjects ? value.mode : "new"

  React.useEffect(() => {
    if (!hasProjects) {
      onChange?.({
        mode: "new",
        selectedProjectId: "",
        newProjectName: value.newProjectName ?? "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProjects])

  const items: SelectToggleItem[] = React.useMemo(
    () => projects.map((p) => ({ id: String(p.id), label: p.name })),
    [projects]
  )

  const newNameTrim = (value.newProjectName ?? "").trim()
  const canNext =
    (mode === "existing" && !!(value.selectedProjectId ?? "").trim()) ||
    (mode === "new" && newNameTrim.length > 0)

  const switchToExisting = () => {
    if (!hasProjects) return
    if (value.mode === "existing") return
    onChange?.({
      mode: "existing",
      selectedProjectId: value.selectedProjectId ?? "",
      newProjectName: "",
    })
  }

  const switchToNew = () => {
    if (value.mode === "new") return
    onChange?.({
      mode: "new",
      selectedProjectId: "",
      newProjectName: value.newProjectName ?? "",
    })
  }

  return (
    <>
      <section className="p-3 bg-background rounded-xl">
        {!hasProjects ? (
          <div className="text-sm text-muted-foreground">
            まだプロジェクトがありません。新規作成してください。
          </div>
        ) : null}

        {hasProjects ? (
          <div className="grid gap-2">
            <Label>既存プロジェクト</Label>

            <div
              role="button"
              tabIndex={0}
              onClick={switchToExisting}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " " ? switchToExisting() : null
              }
              className={[
                "mt-1 transition-colors outline-none rounded-md",
                mode === "existing"
                  ? "border border-foreground/40 bg-muted/30"
                  : "border border-transparent hover:bg-muted/20",
              ].join(" ")}
            >
              <ProjectSelectToggle
                items={items}
                selectedId={
                  mode === "existing" && (value.selectedProjectId ?? "").trim()
                    ? (value.selectedProjectId ?? "").trim()
                    : undefined
                }
                placeholder="プロジェクトを選択"
                open={open}
                onOpenChange={(o) => {
                  setOpen(o)
                  if (o) switchToExisting()
                }}
                onSelect={(id) => {
                  onChange?.({
                    mode: "existing",
                    selectedProjectId: String(id),
                    newProjectName: "",
                  })
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-2">
          <Label>新規プロジェクト</Label>

          <div
            role="button"
            tabIndex={0}
            onClick={switchToNew}
            onKeyDown={(e) =>
              e.key === "Enter" || e.key === " " ? switchToNew() : null
            }
            className={[
              "mt-1 transition-colors outline-none rounded-md p-0.5",
              mode === "new"
                ? "border border-foreground/40 bg-muted/30"
                : "border border-transparent hover:bg-muted/20",
            ].join(" ")}
          >
            <Input
              placeholder="例：TOEIC、期末試験など"
              value={value.newProjectName ?? ""}
              onFocus={(e) => {
                e.stopPropagation()
                switchToNew()
              }}
              onClick={(e) => {
                e.stopPropagation()
                switchToNew()
              }}
              onChange={(e) =>
                onChange?.({
                  mode: "new",
                  selectedProjectId: "",
                  newProjectName: e.target.value,
                })
              }
            />
          </div>
        </div>
      </section>

      <div className="my-6 flex justify-end">
        <Button
          type="button"
          variant="default"
          className="transition-colors"
          onClick={onNext}
          disabled={!canNext}
        >
          次へ
        </Button>
      </div>
    </>
  )
}