"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent as AlertDialogModalContent,
    AlertDialogDescription,
    AlertDialogFooter as AlertDialogModalFooter,
    AlertDialogHeader as AlertDialogModalHeader,
    AlertDialogTitle as AlertDialogModalTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from "lucide-react"
import type { Project } from "@/lib/type/project_type"
import { Field, FieldGroup } from "../ui/field"
import TextInput from "../input/text-input"
import SaveButton from "./save-button"
import { projectBaseSchema } from "@/lib/validators/project"
import { errorToast, successToast } from "../toast"
import { deleteProjectById, saveEditedProjects } from "@/lib/action"

type Props = {
    projectsRow: Project[]
}

type ProjectEditRow = {
    id: number
    title: string
}

export default function ProjectEditButton({
    projectsRow
}: Props) {
    const [open, setOpen] = React.useState<boolean>(false)

    const [projectRow, setProjectRow] = React.useState<ProjectEditRow[]>(
        projectsRow.map((project) => ({
            id: project.id,
            title: project.title,
        }))
    )

    const [titleErrorRow, setTitleErrorRow] = React.useState<(string | undefined)[]>(
        projectsRow.map(() => undefined)
    )

    const [isCompleted, setIsCompleted] = React.useState<boolean>(true)
    const [allErrorMessage, setAllErrorMessage] = React.useState<string | undefined>(undefined)
    const [isPending, setIsPending] = React.useState<boolean>(false)
    const [deletingProjectId, setDeletingProjectId] = React.useState<number | null>(null)

    function handleProjectTitleValue(index: number, value: string) {
        const nextProjectRow = [...projectRow]
        nextProjectRow[index] = {
            ...nextProjectRow[index],
            title: value,
        }
        setProjectRow(nextProjectRow)

        const parsedResult = projectBaseSchema.shape.title.safeParse(value)

        const nextTitleErrorRow = [...titleErrorRow]
        if (!parsedResult.success) {
            nextTitleErrorRow[index] = parsedResult.error.issues[0].message
        } else {
            nextTitleErrorRow[index] = undefined
        }
        setTitleErrorRow(nextTitleErrorRow)
    }

    async function handleDeleteProject(projectId: number, index: number) {
        setDeletingProjectId(projectId)

        const result = await deleteProjectById(projectId)

        if (!result.ok) {
            errorToast(result.message)
            setDeletingProjectId(null)
            return
        }

        setProjectRow((prev) => prev.filter((project) => project.id !== projectId))
        setTitleErrorRow((prev) => prev.filter((_, i) => i !== index))

        successToast(result.message)
        setDeletingProjectId(null)
    }

    React.useEffect(() => {
        if (projectRow.length === 0) {
            setAllErrorMessage(undefined)
            setIsCompleted(true)
            return
        }

        for (const project of projectRow) {
            const result = projectBaseSchema.safeParse({
                title: project.title,
            })

            if (!result.success) {
                setAllErrorMessage(result.error.issues[0].message)
                setIsCompleted(false)
                return
            }
        }

        setAllErrorMessage(undefined)
        setIsCompleted(true)
    }, [projectRow])

    const isDisabled: boolean = !isCompleted || isPending || deletingProjectId !== null

    async function handleSubmit(formData: FormData) {
        setIsPending(true)

        const result = await saveEditedProjects(formData)

        if (!result.ok) {
            errorToast(result.message)
        } else {
            successToast(result.message)
        }

        setIsPending(false)
    }

    React.useEffect(() => {
        if (!open) {
            setProjectRow(
                projectsRow.map((project) => ({
                    id: project.id,
                    title: project.title,
                }))
            )
            setTitleErrorRow(projectsRow.map(() => undefined))
        }
    }, [open, projectsRow])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="lg:h-10 rounded-md text-xs bg-white/70 border border-black/70 lg:p-0 text-black hover:bg-white/50"
                >
                    <Pencil />
                    プロジェクト編集
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md h-[80vh]">
                <form action={handleSubmit} className="h-full flex flex-col min-h-0 gap-4">
                    <input
                        type="hidden"
                        name="projects"
                        value={JSON.stringify(projectRow)}
                    />

                    <DialogHeader>
                        <DialogTitle>プロジェクト編集</DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="flex-1 min-h-0 overflow-y-auto gap-4">
                        {projectRow.length === 0 ? (
                            <div className="flex items-center gap-1">プロジェクトはありません</div>
                        ) : (
                            projectRow.map((project, index) => (
                                <div key={project.id} className="flex items-center gap-1">
                                    <div className="flex-1">
                                        <Field>
                                            <TextInput
                                                id={`project-${project.id}`}
                                                title={undefined}
                                                textValue={project.title}
                                                onTextValueChange={(e) =>
                                                    handleProjectTitleValue(index, e.target.value)
                                                }
                                                inputError={titleErrorRow[index]}
                                            />
                                        </Field>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                disabled={deletingProjectId === project.id}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogModalContent>
                                            <AlertDialogModalHeader>
                                                <AlertDialogModalTitle>
                                                    本当に削除しますか？
                                                </AlertDialogModalTitle>
                                                <AlertDialogDescription>
                                                    「{project.title}」を削除します。この操作は取り消せません。
                                                </AlertDialogDescription>
                                            </AlertDialogModalHeader>

                                            <AlertDialogModalFooter>
                                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        void handleDeleteProject(project.id, index)
                                                    }}
                                                >
                                                    はい
                                                </AlertDialogAction>
                                            </AlertDialogModalFooter>
                                        </AlertDialogModalContent>
                                    </AlertDialog>
                                </div>
                            ))
                        )}
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">キャンセル</Button>
                        </DialogClose>
                        <SaveButton
                            isDisabled={isDisabled}
                            errorMessage={allErrorMessage}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}