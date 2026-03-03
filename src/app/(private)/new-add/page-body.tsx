//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\page-body.tsx
"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

import { type Step } from "./_components/new-add-primary/new-add-step-nav"
import {
  type ProjectOption,
  type ProjectSelectStepValue,
} from "./_components/new-add-primary/project-select-step"
import {
  type MaterialRegisterValue,
  unitLabel,
} from "./_components/new-add-primary/material-register-step"

import PlanAdjustDemo from "./_components/new-add-primary/plan-adjust"
import NewAddPrimaryPanel from "./_components/new-add-primary/new-add-primary-panel"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import PlanAdjustCalendarPanel from "./_components/new-add-primary/plan-adjust-calendar-panel"

import { saveNewMaterialAction } from "./actions"
import { updateMaterialAction } from "./actions"

function fmtISODate(d?: Date) {
  if (!d) return ""
  return format(d, "yyyy-MM-dd")
}

export default function NewAddPageBody({
  projects,
  initial,
}: {
  projects: ProjectOption[]
  initial?: {
    editSlug: string
    projectId?: string
    title?: string
    startDate?: string
    endDate?: string
    unitType?: any
    unitCount?: number
    laps?: number
    planDays?: number[]
  }
}) {
  const isEdit = !!initial?.editSlug

  const [step1, setStep1] = React.useState<ProjectSelectStepValue>(() => ({
    mode: "existing",
    selectedProjectId: initial?.projectId ?? "",
    newProjectName: "",
  }))

  const [materialStep, setMaterialStep] = React.useState<MaterialRegisterValue>(() => ({
    title: initial?.title ?? "",
    startDate: initial?.startDate ? new Date(`${initial.startDate}T00:00:00`) : undefined,
    endDate: initial?.endDate ? new Date(`${initial.endDate}T00:00:00`) : undefined,
    unitType: (initial?.unitType as any) ?? "section",
    unitCount: initial?.unitCount != null ? String(initial.unitCount) : "",
    laps: initial?.laps != null ? String(initial.laps) : "",
  }))

  const [planDays, setPlanDays] = React.useState<number[]>(
    () => (initial?.planDays && Array.isArray(initial.planDays) ? initial.planDays : [])
  )

  const [restDays, setRestDays] = React.useState<Set<number>>(
    () => new Set<number>()
  )

  const [openDetails, setOpenDetails] = React.useState(false)

  const [isSaving, setIsSaving] = React.useState(false)

  const [currentStep, setCurrentStep] = React.useState<Step>(() =>
    isEdit ? 2 : 1
  )

  const goStep2 = () => setCurrentStep(2)

  const range: DateRange | undefined =
    materialStep.startDate && materialStep.endDate
      ? { from: materialStep.startDate, to: materialStep.endDate }
      : undefined

  const unitCountNum =
    materialStep.unitCount && Number(materialStep.unitCount) > 0
      ? Number(materialStep.unitCount)
      : undefined

  const lapsNum =
    materialStep.laps && Number(materialStep.laps) > 0
      ? Number(materialStep.laps)
      : undefined

  const unitLabelText = unitLabel(materialStep.unitType)

  const handleSave = async () => {
  if (isSaving) return 

  const startISO = fmtISODate(materialStep.startDate)
  const endISO = fmtISODate(materialStep.endDate)

  const totalTasks =
    (unitCountNum ?? 0) > 0 && (lapsNum ?? 0) > 0 ? unitCountNum! * lapsNum! : 0

  if (!startISO || !endISO) return
  if (!unitCountNum || !lapsNum) return
  if (!materialStep.title.trim()) return
  if (!planDays.length) return

  const sum = planDays.reduce((a, b) => a + b, 0)
  if (sum !== totalTasks) return

  try {
    setIsSaving(true) 

    if (isEdit) {
      await updateMaterialAction({
        slug: initial!.editSlug,
        projectMode: step1.mode,
        selectedProjectId: step1.selectedProjectId,
        newProjectName: step1.newProjectName,
        title: materialStep.title.trim(),
        startDate: startISO,
        endDate: endISO,
        unitType: materialStep.unitType,
        unitCount: unitCountNum,
        rounds: lapsNum,
        planDays,
      })
      return
    }

    await saveNewMaterialAction({
      projectMode: step1.mode,
      selectedProjectId: step1.selectedProjectId,
      newProjectName: step1.newProjectName,
      title: materialStep.title.trim(),
      startDate: startISO,
      endDate: endISO,
      unitType: materialStep.unitType,
      unitCount: unitCountNum,
      rounds: lapsNum,
      planDays,
      actualDays: Array.from({ length: planDays.length }, () => 0),
    })
  } finally {
    setIsSaving(false)
  }
}

  const stableInitialPlanDays = isEdit
    ? (Array.isArray(initial?.planDays) ? initial!.planDays! : [])
    : undefined

  return (
  <main className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 h-full min-h-0">
    <div className="flex-1 min-h-0 md:col-span-1 md:flex-none">
      <NewAddPrimaryPanel
        currentStep={currentStep}
        onChangeStep={setCurrentStep}
        projects={projects}
        step1={step1}
        onChangeStep1={setStep1}
        onNext={goStep2}
        materialStep={materialStep}
        onChangeMaterialStep={setMaterialStep}
        restDays={restDays}
        onChangeRestDays={setRestDays}
        onOpenDetails={() => setOpenDetails(true)}
        onSave={handleSave}
        isEdit={isEdit}
        isSaving={isSaving} 
      />
    </div>

    <div className="hidden md:flex md:col-span-1 lg:col-span-2 h-full min-h-0">
      <PlanAdjustDemo
        range={range}
        unitCount={unitCountNum}
        laps={lapsNum}
        unitLabel={unitLabelText}
        restDays={restDays}
        unitType={materialStep.unitType}
        onPlanDaysChange={setPlanDays}
        initialPlanDays={stableInitialPlanDays}
      />
    </div>

    <div className="md:hidden">
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="bottom" className="p-0 max-h-[85vh]">
          <div className="h-[85vh] p-3 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              {range?.from && range?.to && unitCountNum && lapsNum && unitLabelText ? (
                <PlanAdjustCalendarPanel
                  range={range}
                  unitCount={unitCountNum}
                  laps={lapsNum}
                  unitLabel={unitLabelText}
                  restDays={restDays}
                  unitType={materialStep.unitType}
                  onPlanDaysChange={setPlanDays}
                  initialPlanDays={stableInitialPlanDays}
                />
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </main>
)
}