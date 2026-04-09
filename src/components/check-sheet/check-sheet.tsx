"use client"

import SaveButton from "@/components/button/save-button"
import { errorToast, successToast } from "@/components/toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import DateInput from "../input/date-input"
import React from "react"
import NumberInput from "../input/number-input"
import TextAreaInput from "../input/textarea-input"
import { taskCount } from "@/lib/constant/material-constant"
import { CheckSheetSchema } from "@/lib/validators/record"
import { getMaterialRecordRows, type RecordRow } from "./_lib/queries"
import { saveRecord, updateRecord } from "./_lib/action"
import { useRouter } from "next/navigation"

type Props = {
    userId: string
    open: boolean
    onOpenChenge: () => void
    id: number
    title: string
}

export default function CheckSheet({
    userId,
    open,
    onOpenChenge,
    id,
    title,
}: Props) {
    const [dateValue, setDateValue] = React.useState<Date>(new Date())
    const [dateError, setDateError] = React.useState<string | undefined>(undefined)

    function handleDateValue(date: Date) {
        const parsedResult = CheckSheetSchema.shape.date.safeParse(date)

        if (!parsedResult.success) {
            setDateError(parsedResult.error.issues[0]?.message)
        } else {
            setDateError(undefined)
        }

        setDateValue(date)
    }

    const [taskCountValue, setTaskCountValue] = React.useState<string>("0")
    const [taskCountError, setTaskCountError] = React.useState<string | undefined>(undefined)

    function handleTaskCountValue(e: React.ChangeEvent<HTMLInputElement>) {
        let v = e.target.value
        if (!/^\d*$/.test(v)) return

        if (v.length > 1) v = v.replace(/^0+/, "")
        if (v === "") {
            setTaskCountValue("")
            setTaskCountError("タスク数を入力してください")
            return
        }

        const num = Number(v)
        if (num > taskCount.max) return

        const parsedResult = CheckSheetSchema.shape.task_count.safeParse(num)

        if (!parsedResult.success) {
            setTaskCountError(parsedResult.error.issues[0]?.message)
        } else {
            setTaskCountError(undefined)
        }

        setTaskCountValue(v)
    }

    const [studyTimeValue, setStudyTimeValue] = React.useState<string>("0")
    const [studyTimeError, setStudyTimeError] = React.useState<string | undefined>(undefined)

    function handleStudyTimeValue(e: React.ChangeEvent<HTMLInputElement>) {
        let v = e.target.value
        if (!/^\d*$/.test(v)) return

        if (v.length > 1) v = v.replace(/^0+/, "")
        if (v === "") {
            setStudyTimeValue("")
            setStudyTimeError("学習時間を入力してください")
            return
        }

        const num = Number(v)
        if (num > taskCount.max) return

        const parsedResult = CheckSheetSchema.shape.study_time.safeParse(num)

        if (!parsedResult.success) {
            setStudyTimeError(parsedResult.error.issues[0]?.message)
        } else {
            setStudyTimeError(undefined)
        }

        setStudyTimeValue(v)
    }

    const [contentValue, setContentValue] = React.useState<string>("")
    const [contentError, setContentError] = React.useState<string | undefined>(undefined)

    function handleContentValue(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const v = e.target.value

        const parsedResult = CheckSheetSchema.shape.study_content.safeParse(v)

        if (!parsedResult.success) {
            setContentError(parsedResult.error.issues[0]?.message)
        } else {
            setContentError(undefined)
        }

        setContentValue(v)
    }

    const [recordId, setRecordId] = React.useState<number | null>(null)
    const [recordRow, setRecordRow] = React.useState<RecordRow[]>([])

    const [isCompleted, setIsCompleted] = React.useState<boolean>(false)
    const [allErrorMessage, setAllErrorMessage] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        const rowData = {
            date: dateValue,
            task_count: Number(taskCountValue),
            study_time: Number(studyTimeValue),
            study_content: contentValue,
        }

        const result = CheckSheetSchema.safeParse(rowData)

        if (!result.success) {
            setAllErrorMessage(result.error.issues[0]?.message)
            setIsCompleted(false)
        } else {
            setAllErrorMessage(undefined)
            setIsCompleted(true)
        }
    }, [dateValue, taskCountValue, studyTimeValue, contentValue])

    const isDisabled: boolean = !isCompleted

    const router = useRouter()
    async function handleSubmit(formData: FormData) {
        const result = recordId === null
            ? await saveRecord(id, formData)
            : await updateRecord(recordId, formData)

        if (!result.ok) {
            errorToast(result.message)
        } else {
            successToast(result.message)
            onOpenChenge()
            router.refresh()
        }

    }

    React.useEffect(() => {
        if (!open) return

        async function fetchData() {
            const records = await getMaterialRecordRows(userId, id)
            setRecordRow(records)
        }

        fetchData()
    }, [open, userId, id])

    React.useEffect(() => {
        const record = recordRow.find((record) => {
            const recordDate = new Date(record.date)
            return (
                recordDate.getFullYear() === dateValue.getFullYear() &&
                recordDate.getMonth() === dateValue.getMonth() &&
                recordDate.getDate() === dateValue.getDate()
            )
        })

        if (!record) {
            setRecordId(null)
            setTaskCountValue("0")
            setStudyTimeValue("0")
            setContentValue("")
            return
        }

        setRecordId(record.id)
        setTaskCountValue(record.task_count)
        setStudyTimeValue(record.study_time)
        setContentValue(record.study_content)
    }, [dateValue, recordRow])

    return (
        <Dialog open={open} onOpenChange={onOpenChenge}>
            <DialogContent className="sm:max-w-sm h-[calc(80vh)]">
                <form action={handleSubmit} className="h-full flex flex-col">
                    <input type="hidden" name="material_id" value={id} />

                    <DialogHeader>
                        <DialogTitle className="m-1 leading-normal">{`「${title}」 の学習記録`}</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-4 h-full min-h-0 overflow-y-auto">
                        <Field>
                            <DateInput
                                id={"date"}
                                title={"日付"}
                                dateValue={dateValue}
                                setDateValue={handleDateValue}
                                dateError={dateError}
                            />
                        </Field>

                        <Field>
                            <NumberInput
                                id={"task_count"}
                                title={"タスク数"}
                                numberValue={taskCountValue}
                                setNumberValue={handleTaskCountValue}
                                numberError={taskCountError}
                            />
                        </Field>

                        <Field>
                            <NumberInput
                                id={"study_time"}
                                title={"学習時間（分）"}
                                numberValue={studyTimeValue}
                                setNumberValue={handleStudyTimeValue}
                                numberError={studyTimeError}
                            />
                        </Field>

                        <Field>
                            <TextAreaInput
                                id={"study_content"}
                                title={"内容（任意）"}
                                textValue={contentValue}
                                onTextValueChange={handleContentValue}
                                inputError={contentError}
                                placeholder={"例) 第1章～第3章"}
                            />
                        </Field>
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