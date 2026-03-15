"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { ProjectDetails } from "@/lib/type/project_type"
import { Label } from "@/components/ui/label"

type ConfirmDelete = { id: number; slug: string | undefined; name: string } | null

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  renameValue: string
  onRenameValueChange: (v: string) => void
  orderProjects: ProjectDetails[]
  setOrderProjects: React.Dispatch<React.SetStateAction<ProjectDetails[]>>
  selectedSlug: string
  isSaving: boolean
  onSave: () => Promise<void> | void
  isDeletingProjectId: string | null
  onDeleteProject: (projectId: number) => Promise<void>
}

export function ProjectEditDialog({
  open,
  onOpenChange,
  renameValue,
  onRenameValueChange,
  orderProjects,
  setOrderProjects,
  selectedSlug,
  isSaving,
  onSave,
  isDeletingProjectId,
  onDeleteProject,
}: Props) {

  const [dragId, setDragId] = React.useState<string | null>(null)
  const [confirmDeleteProject, setConfirmDeleteProject] = React.useState<ConfirmDelete>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>プロジェクト編集</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-1">
          <Label id="name">プロジェクト名</Label>
          <Input name="name" value={renameValue} onChange={(e) => onRenameValueChange(e.target.value)} />

          <div className="mt-4">
            <Label id="プロジェクトの順番">プロジェクトの順番</Label>
            <div className="text-xs text-muted-foreground mb-2">ドラッグして並び替え</div>

            <div className="space-y-2">
              {orderProjects.map((p) => {
                const id = String(p.id)
                const isCurrent = p.slug === selectedSlug
                const isDeletingThis = isDeletingProjectId === id

                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => setDragId(id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!dragId || dragId === id) return
                      setOrderProjects((prev) => {
                        const from = prev.findIndex((x) => String(x.id) === dragId)
                        const to = prev.findIndex((x) => String(x.id) === id)
                        if (from < 0 || to < 0) return prev
                        const next = [...prev]
                        const [moved] = next.splice(from, 1)
                        next.splice(to, 0, moved)
                        return next
                      })
                      setDragId(null)
                    }}
                    onDragEnd={() => setDragId(null)}
                    className={[
                      "flex items-center justify-between gap-3",
                      "rounded-md border px-3 py-2 bg-muted",
                      "cursor-grab active:cursor-grabbing",
                      dragId === id ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      {isCurrent ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-background text-muted-foreground">
                          選択中
                        </span>
                      ) : null}
                    </div>

                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label="プロジェクトを削除"
                        title="削除"
                        disabled={isDeletingThis}
                        onClick={() => {
                          setConfirmDeleteProject({ id: p.id, slug: p.slug, name: p.name })
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              キャンセル
            </Button>
            <Button onClick={onSave} disabled={isSaving || !renameValue.trim() || orderProjects.length === 0}>
              保存
            </Button>
          </div>
        </div>

        <AlertDialog
          open={!!confirmDeleteProject}
          onOpenChange={(o) => {
            if (!o) setConfirmDeleteProject(null)
          }}
        >
          <AlertDialogContent className="z-[200]">
            <AlertDialogHeader>
              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                「{confirmDeleteProject?.name ?? ""}」を削除すると、プロジェクト内の教材データも削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={!!confirmDeleteProject && isDeletingProjectId === String(confirmDeleteProject.id)}
              >
                キャンセル
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={!confirmDeleteProject || isDeletingProjectId === String(confirmDeleteProject.id)}
                onClick={() => {
                  if (!confirmDeleteProject) return
                  void onDeleteProject(confirmDeleteProject.id)
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {!!confirmDeleteProject && isDeletingProjectId === String(confirmDeleteProject.id)
                  ? "削除中..."
                  : "削除する"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}