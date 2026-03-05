//C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\_components\material-editor-primary\material-editor-primary-panel.tsx
"use client"

import * as React from "react"

import ProjectSelectStep, {
  type ProjectOption,
  type ProjectSelectStepValue,
} from "./project-select-step"
import MaterialRegisterStep, { MaterialRegisterValue } from "./material-register-step"
import NewAddStepNav, { Step } from "./material-editor-step-nav"

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

  onSave?: () => Promise<void> | void
  isSaving?: boolean
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
  isSaving,
  isEdit,
}: Props) {
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="rounded-md mb-4">
        <NewAddStepNav
          current={currentStep}
          onChange={(step) => {
            if (step === 1) onChangeStep(1)
            if (step === 2) onNext()
          }}
        />
      </div>
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
            isSaving={isSaving}
            isEdit={isEdit}
            onBack={() => onChangeStep(1)}
          />
        )}
      </div>
    </div>
  )
}