"use client"

import SaveButton from "@/components/button/save-button"
import MaterialBasicRegisterPanel from "./material-basic-register-panel"
import MaterialTaskRegisterPanel from "./material-task-register-panel"
import CancelButton from "@/components/cancel-button"
import React from "react"
import { MaterialBaseSchema, MaterialDateRangeSchema } from "@/lib/validators/material"
import { rounds, title, unitCount } from "@/lib/constant/material-constant"
import { Project } from "@/lib/type/project_type"
import { saveNewMaterial, updateMaterial } from "./_lib/actions"
import { errorToast, successToast } from "@/components/toast"
import { useRouter } from "next/navigation"
import type { Material } from "@/lib/type/material_type"

type Props = {
  userId: string,
  projectsRow: Project[],
  initialMaterial: Material | null,
  editSlug?: string
}

function toDate(value?: string | Date | null) {
  if (!value) return new Date()
  return value instanceof Date ? value : new Date(value)
}

export default function MaterialEditorPageBody({
  projectsRow,
  initialMaterial,
  editSlug
}: Props) {

  const today = new Date()
  const isEditMode = !!initialMaterial && !!editSlug

  console.log(isEditMode)

  // 教材名
  const [materialNameValue, setMaterialNameValue] = React.useState<string>(initialMaterial?.title ?? "")
  const [materialNameError, setMaterialNameError] = React.useState<string | undefined>(undefined)

  function handleMaterialValue(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value.length > title.max) return

    const parsedResult = MaterialBaseSchema.shape.title.safeParse(value)

    if (!parsedResult.success) {
      setMaterialNameError(parsedResult.error.issues[0]?.message)
    } else {
      setMaterialNameError(undefined)
    }

    setMaterialNameValue(value)
  }

  //プロジェクト
  const [projectValue, setProjectValue] = React.useState<string>(
    initialMaterial?.project_id != null ? String(initialMaterial.project_id) : ""
  )
  const [projectError, setProjectError] = React.useState<string | undefined>(undefined)

  function handleProjectValue(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value

    const parsedResult = MaterialBaseSchema.shape.project.safeParse(value)

    if (!parsedResult.success) {
      setProjectError(parsedResult.error.issues[0]?.message)
    } else {
      setProjectError(undefined)
    }

    setProjectValue(value)
  }

  // 開始日
  const [startDateValue, setStartDateValue] = React.useState<Date>(
    initialMaterial?.start_date
      ? toDate(initialMaterial.start_date)
      : new Date()
  )
  const [startDateError, setStartDateError] = React.useState<string | undefined>(undefined)

  function handleStartDateValue(date: Date) {

    const parsedResult = MaterialDateRangeSchema.safeParse({
      start_date: date,
      end_date: endDateValue,
    })

    if (!parsedResult.success) {
      setStartDateError(parsedResult.error.flatten().fieldErrors.start_date?.[0])
      setEndDateError(parsedResult.error.flatten().fieldErrors.end_date?.[0])
    } else {
      setStartDateError(undefined)
      setEndDateError(undefined)
    }

    setStartDateValue(date)
  }

  //終了日
  const [endDateValue, setEndDateValue] = React.useState<Date>(
    initialMaterial?.end_date
      ? toDate(initialMaterial.end_date)
      : new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  )
  const [endDateError, setEndDateError] = React.useState<string | undefined>(undefined)

  function handleEndDateValue(date: Date) {
    const parsedResult = MaterialDateRangeSchema.safeParse({
      start_date: startDateValue,
      end_date: date,
    })

    if (!parsedResult.success) {
      setStartDateError(parsedResult.error.flatten().fieldErrors.start_date?.[0])
      setEndDateError(parsedResult.error.flatten().fieldErrors.end_date?.[0])
    } else {
      setStartDateError(undefined)
      setEndDateError(undefined)
    }

    setEndDateValue(date)
  }
  //ユニットタイプ
  const [unitTypeValue, setUnitTypeValue] = React.useState<string>(initialMaterial?.unit_type ?? "")

  function handleUnitTypeValue(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value

    setUnitTypeValue(value)
  }

  //ユニット数
  const [unitCountValue, setUnitCountValue] = React.useState<string>(
    initialMaterial?.unit_count != null ? String(initialMaterial.unit_count) : "1"
  )
  const [unitCountError, setUnitCountError] = React.useState<string | undefined>(undefined)

  function handleUnitCountValue(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value
    if (!/^\d*$/.test(v)) return

    if (v.length > 1) v = v.replace(/^0+/, "")
    if (v === "") {
      setUnitCountValue("")
      setUnitCountError("ユニット数を入力してください")
      return
    }

    const num = Number(v)
    if (num > unitCount.max) return

    const parsedResult = MaterialBaseSchema.shape.unit_count.safeParse(num)

    if (!parsedResult.success) {
      setUnitCountError(parsedResult.error.issues[0]?.message)
    } else {
      setUnitCountError(undefined)
    }

    setUnitCountValue(v)
  }

  //周回数
  const [roundsValue, setRoundsValue] = React.useState<string>(
    initialMaterial?.rounds != null ? String(initialMaterial.rounds) : "1"
  )
  const [roundsError, setRoundsError] = React.useState<string | undefined>(undefined)

  function handleRoundValue(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value
    if (!/^\d*$/.test(v)) return

    if (v.length > 1) v = v.replace(/^0+/, "")
    if (v === "") {
      setRoundsValue("")
      setRoundsError("周回数を入力してください")
      return
    }

    const num = Number(v)
    if (num > rounds.max) return

    const parsedResult = MaterialBaseSchema.shape.rounds.safeParse(num)

    if (!parsedResult.success) {
      setRoundsError(parsedResult.error.issues[0]?.message)
    } else {
      setRoundsError(undefined)
    }

    setRoundsValue(v)
  }

  const [isCompleted, setIsCompleted] = React.useState<boolean>(false)

  const [allErrorMessage, setAllErrorMessage] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {

    const rowData = {
      title: materialNameValue,
      project: projectValue,
      start_date: startDateValue,
      end_date: endDateValue,
      unit_type: unitTypeValue,
      unit_count: Number(unitCountValue),
      rounds: Number(roundsValue)
    }

    const result = MaterialBaseSchema.safeParse(rowData)

    if (!result.success) {
      setAllErrorMessage(result.error.issues[0].message)
      setIsCompleted(false)
    } else {
      setAllErrorMessage(undefined)
      setIsCompleted(true)
    }

  }, [materialNameValue, projectValue, startDateValue, endDateValue, unitTypeValue, unitCountValue, roundsValue])

  const isDisabled: boolean = !isCompleted

  const router = useRouter()
  //保存処理
  async function handleSubmit(formData: FormData) {
    const result = isEditMode
      ? await updateMaterial(formData)
      : await saveNewMaterial(formData)

    if (!result.ok) {
      errorToast(result.message)
    }
    else {
      successToast(result.message)
      router.push("/dashboard")
    }
  }

  return (
    <>
      <form action={handleSubmit} className="lg:h-full min-h-0 flex flex-col justify-between p-1 overflow-y-auto">
        {isEditMode ? (
          <input type="hidden" name="editSlug" value={editSlug} />
        ) : null}

        <div className="lg:grid lg:grid-cols-2  lg:h-6/7 ">
          <div className="min-h-0 col-span-1 lg:h-full p-1">
            <MaterialBasicRegisterPanel
              projectsRow={projectsRow}
              materialNameValue={materialNameValue}
              handleMaterialValue={handleMaterialValue}
              materialNameError={materialNameError}
              projectValue={projectValue}
              handleProjectValue={handleProjectValue}
              projectError={projectError}
              startDateValue={startDateValue}
              handleStartDateValue={handleStartDateValue}
              startDateError={startDateError}
              endDateValue={endDateValue}
              handleEndDateValue={handleEndDateValue}
              endDateError={endDateError}
              unitTypeValue={unitTypeValue}
              handleUnitTypeValue={handleUnitTypeValue}
              unitCountValue={unitCountValue}
              handleUnitCountValue={handleUnitCountValue}
              unitCountError={unitCountError}
              roundValue={roundsValue}
              handleRoundValue={handleRoundValue}
              roundsError={roundsError}
            />
          </div>
          <div className="mt-4 lg:mt-0 min-h-0 lg:col-span-1 lg:h-full p-1">
            <MaterialTaskRegisterPanel
              startDate={startDateValue}
              endDate={endDateValue}
              unitCount={Number(unitCountValue)}
              rounds={Number(roundsValue)}
              initialTaskRatioRow={initialMaterial?.task_ratio_row ?? null}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 mb-25 lg:mb-0">
          <div className="col-span-1 p-1">
            <CancelButton />
          </div>
          <div className="col-span-1 p-1">
            <SaveButton
              isDisabled={isDisabled}
              errorMessage={allErrorMessage}
            />
          </div>
        </div>
      </form>
    </>
  )
}