//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\_components\new-add-primary\new-add-primary-panel.tsx
"use client"

import * as React from "react"

import ProjectSelectStep, {
  type ProjectOption,
  type ProjectSelectStepValue,
} from "./project-select-step"
import MaterialRegisterStep, { MaterialRegisterValue } from "./material-register-step"
import NewAddStepNav, { Step } from "./new-add-step-nav"

type Props = {
  currentStep: Step
  projects: ProjectOption[]
  step1: ProjectSelectStepValue
  onChangeStep1: (v: ProjectSelectStepValue) => void
  onChangeStep: (s: Step) => void
  onNext: () => void
  materialStep: MaterialRegisterValue
  onChangeMaterialStep: (v: MaterialRegisterValue) => void
  restDays: Set<number>
  onChangeRestDays: React.Dispatch<React.SetStateAction<Set<number>>>
  onOpenDetails?: () => void
  onSave?: () => void
  isEdit?: boolean
}

export default function NewAddPrimaryPanel({
  currentStep,
  projects,
  step1,
  onChangeStep1,
  onChangeStep,
  onNext,
  materialStep,
  onChangeMaterialStep,
  restDays,
  onChangeRestDays,
  onOpenDetails,
  onSave,
  isEdit,
}: Props) {
  return (
    // ✅ 子が h-full を使えるように親も min-h-0 / h-full
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="pb-4 rounded-md mb-4">
        <NewAddStepNav
          current={currentStep}
          onChange={(step) => {
            if (step === 1) onChangeStep(1)
            if (step === 2) onNext()
          }}
        />
      </div>

      {/* ✅ ここも min-h-0 必須（子の overflow が効く） */}
      <div className="flex-1 min-h-0 rounded-xl">
        {currentStep === 1 ? (
          <ProjectSelectStep
            projects={projects}
            value={step1}
            onChange={onChangeStep1}
            onNext={onNext}
          />
        ) : (
          <MaterialRegisterStep
            value={materialStep}
            onChange={onChangeMaterialStep}
            restDays={restDays}
            onChangeRestDays={onChangeRestDays}
            onOpenDetails={onOpenDetails}
            onSave={onSave}
            isEdit={isEdit}
            onBack={() => onChangeStep(1)}   // ✅ これで「戻る」→ Step1へ
          />
        )}
      </div>
    </div>
  )
}