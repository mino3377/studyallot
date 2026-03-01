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
}: Props) {
  return (
    <div className="flex flex-col w-full">
      <div className="pb-4 rounded-md mb-4">
        <NewAddStepNav
          current={currentStep}
          onChange={(step) => {
            if (step === 1) onChangeStep(1)
            if (step === 2) onNext()
          }}
        />
      </div>
      <div className="flex-1 rounded-xl">
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
          />
        )}
      </div>
    </div>
  )
}