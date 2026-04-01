//C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\material-basic-register-panel.tsx

"use client"

import DateInput from "@/components/input/date-input"
import NumberInput from "@/components/input/number-input"
import SelectInput from "@/components/input/select-input"
import TextInput from "@/components/input/text-input"
import ProjectAddButton from "@/components/button/project-add-button"
import ProjectEditButton from "@/components/button/project-edit-button"
import { Project } from "@/lib/type/project_type"
import { unitOptions } from "@/lib/type/unit-type"
import React from "react"

type Props = {
  projectsRow: Project[]
  materialNameValue: string
  handleMaterialValue: (e: React.ChangeEvent<HTMLInputElement>) => void
  projectValue: string | undefined
  handleProjectValue: (e: React.ChangeEvent<HTMLSelectElement>) => void
  projectError: string | undefined
  materialNameError: string | undefined
  startDateValue: Date
  handleStartDateValue: (date: Date) => void
  startDateError: string | undefined
  endDateValue: Date
  handleEndDateValue: (date: Date) => void
  endDateError: string | undefined
  unitTypeValue: string
  handleUnitTypeValue: (e: React.ChangeEvent<HTMLSelectElement>) => void
  unitCountValue: string
  handleUnitCountValue: (e: React.ChangeEvent<HTMLInputElement>) => void
  unitCountError: string | undefined
  roundValue: string
  handleRoundValue: (e: React.ChangeEvent<HTMLInputElement>) => void
  roundsError: string | undefined
}

export default function MaterialBasicRegisterPanel({
  projectsRow,
  materialNameValue,
  handleMaterialValue,
  materialNameError,
  projectValue,
  handleProjectValue,
  projectError,
  startDateValue,
  handleStartDateValue,
  startDateError,
  endDateValue,
  handleEndDateValue,
  endDateError,
  unitTypeValue,
  handleUnitTypeValue,
  unitCountValue,
  handleUnitCountValue,
  unitCountError,
  roundValue,
  handleRoundValue,
  roundsError
}: Props) {

  return (
    <div className="space-y-5 p-3 rounded-2xl lg:h-full">
      <div className="h-12">
        <div className="text-2xl font-semibold ">教材情報</div>
        <div className="text-xs text-muted-foreground ml-6">─ 新規教材の基本的な情報</div>
      </div>

      {/* 教材名 */}
      <div className="">
        <TextInput
          id={"materialname"}
          title={"教材名"}
          textValue={materialNameValue}
          onTextValueChange={handleMaterialValue}
          inputError={materialNameError}
        />
      </div>

      {/* プロジェクト選択 */}
      <div className="lg:grid lg:grid-cols-2 ">
        <div className="pr-1">
          <SelectInput
            id={"project"}
            title={"プロジェクト選択"}
            value={projectValue}
            options={projectsRow}
            onChangeValue={handleProjectValue}
            selectError={projectError}
          />
        </div>
        <div className="flex flex-col mt-4 lg:flex-wrap lg:mt-0 lg:items-end lg:justify-center gap-2">
          <ProjectAddButton />
          <ProjectEditButton projectsRow={projectsRow}/>
        </div>
      </div>

      {/* 開始日と終了日 */}
      <div className="grid grid-cols-2">
        <div className="col-span-1 pr-1">
          <DateInput
            id={"startdate"}
            title={"開始日"}

            dateValue={startDateValue}
            setDateValue={handleStartDateValue}
            dateError={startDateError}
          />
        </div>
        <div className="col-span-1 pl-1">
          <DateInput
            id={"enddate"}
            title={"終了日"}
            dateValue={endDateValue}
            setDateValue={handleEndDateValue}
            dateError={endDateError}
          />
        </div>
      </div>

      {/* タイプ選択 */}
      <div className="w-1/2 pr-1 ">
        <SelectInput
          id={"unittype"}
          title={"タイプ選択"}
          value={unitTypeValue}
          options={unitOptions}
          onChangeValue={handleUnitTypeValue}
        />
      </div>

      {/* ユニット数と周回数 */}
      <div className="grid grid-cols-2">
        <div className=" col-span-1 pr-1">
          <NumberInput
            id={"unitcount"}
            title={"ユニット数"}
            numberValue={unitCountValue}
            setNumberValue={handleUnitCountValue}
            numberError={unitCountError}

          />
        </div>
        <div className="col-span-1 pl-1">
          <NumberInput
            id={"rounds"}
            title={"周回数"}
            numberValue={roundValue}
            setNumberValue={handleRoundValue}
            numberError={roundsError}
          />
        </div>
      </div>

    </div>
  )
}