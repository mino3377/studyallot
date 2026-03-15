"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { useSearchParams } from "next/navigation"
import { type Step } from "./_components/primary-panel/material-editor-step-nav"
import {
  type ProjectOption,
  type ProjectSelectStepValue,
} from "./_components/primary-panel/project-select-step"
import { type MaterialRegisterValue } from "./_components/primary-panel/material-register-step"

import MaterialEditorPrimaryPanel from "./_components/primary-panel/material-editor-primary-panel"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import PlanAdjustCalendar from "./_components/plan-adjust-calendar"

import { saveNewMaterialAction, updateMaterialAction } from "./actions"
import { unit_type, unitLabel as unit_typeLabel } from "@/lib/type/unit-type"

import { createTemplateAction, fetchTemplateAction } from "./template-actions"
import { addDays } from "date-fns"
import { PlanShareDialog } from "./_components/plan-share-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { NotebookPen } from "lucide-react"
import { unitLabelByType } from "@/lib/unit-wording"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import {
  buildMaterialEditorSaveDraft,
  buildMaterialEditorShareDraft,
  getPlanSummary,
} from "./_lib/editor-payload"
import {
  MaterialEditorSaveSchema,
  MaterialEditorShareSchema,
} from "./_lib/editor-validator"

export default function MaterialEditorPageBody({
  projects,
  initial,
}: {
  projects: ProjectOption[]
  initial?: {
    edit_slug: string
    project_id: string
    title: string
    start_date: string
    end_date: string
    unit_type: unit_type
    unit_count: number
    rounds: number
    plan_days: number[]
  }
}) {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const isTemplateMode = !!templateId
  const isEdit = !!initial?.edit_slug && !isTemplateMode

  const [step1, setStep1] = React.useState<ProjectSelectStepValue>(() => ({
    mode: "existing",
    selectedProjectId: initial?.project_id ?? "",
    newProjectName: "",
  }))

  const [materialStep, setMaterialStep] = React.useState<MaterialRegisterValue>(() => ({
    title: initial?.title ?? "",
    start_date: initial?.start_date ? new Date(`${initial.start_date}T00:00:00`) : undefined,
    end_date: initial?.end_date ? new Date(`${initial.end_date}T00:00:00`) : undefined,
    unit_type: initial?.unit_type as unit_type,
    unit_count: initial?.unit_count != null ? String(initial.unit_count) : "",
    rounds: initial?.rounds != null ? String(initial.rounds) : "",
  }))

  const [planDays, setPlanDays] = React.useState<number[]>(
    () => (initial?.plan_days && Array.isArray(initial.plan_days) ? initial.plan_days : [])
  )
  const [templateInitialPlanDays, setTemplateInitialPlanDays] = React.useState<
    number[] | undefined
  >(undefined)

  const [restDays, setRestDays] = React.useState<Set<number>>(() => new Set<number>())
  const [openDetails, setOpenDetails] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveValidationMessage, setSaveValidationMessage] = React.useState("")

  const [currentStep, setCurrentStep] = React.useState<Step>(() => (isEdit ? 2 : 1))
  const goStep2 = () => setCurrentStep(2)

  const range: DateRange | undefined =
    materialStep.start_date && materialStep.end_date
      ? { from: materialStep.start_date, to: materialStep.end_date }
      : undefined

  const rawunit_count = Number(materialStep.unit_count)
  const unit_countNum =
    materialStep.unit_count !== "" && Number.isInteger(rawunit_count) && rawunit_count > 0
      ? rawunit_count
      : undefined

  const rawRoundsCount = Number(materialStep.rounds)
  const roundsCountNum =
    materialStep.rounds !== "" &&
      Number.isInteger(rawRoundsCount) &&
      rawRoundsCount > 0
      ? rawRoundsCount
      : undefined

  const unitLabelText = unit_typeLabel(materialStep.unit_type)

  const [shareOpen, setShareOpen] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState("")

  const [notice, setNotice] = React.useState<string>("")
  const noticeTimerRef = React.useRef<number | null>(null)
  const appliedRef = React.useRef<string | null>(null)

  const [isPlanManuallyChanged, setIsPlanManuallyChanged] = React.useState(false)

  React.useEffect(() => {
    if (!templateId) return
    if (appliedRef.current === templateId) return
    appliedRef.current = templateId

      ; (async () => {
        const t = await fetchTemplateAction(templateId)

        const pname = (t.projectName ?? "").trim()
        if (pname.length > 0) {
          const hit = projects.find((p) => p.name.trim() === pname)
          if (hit) {
            setStep1({ mode: "existing", selectedProjectId: String(hit.id), newProjectName: "" })
          } else {
            setStep1({ mode: "new", selectedProjectId: "", newProjectName: pname })
          }
        } else {
          setStep1((prev) => ({ ...prev, mode: "new", selectedProjectId: "" }))
        }

        const today = new Date()
        const fetchedPlanDays = Array.isArray(t.planDays) ? t.planDays : []
        const planDaysCount = fetchedPlanDays.length
        const end_date = addDays(today, Math.max(0, planDaysCount - 1))

        setMaterialStep({
          title: t.title ?? "",
          start_date: today,
          end_date,
          unit_type: t.unit_type,
          unit_count: String(t.unit_count ?? ""),
          rounds: String(t.rounds ?? ""),
        })

        setPlanDays(fetchedPlanDays)
        setTemplateInitialPlanDays(fetchedPlanDays)
        setCurrentStep(2)
      })()
  }, [templateId, projects])

  const showNotice = (msg: string) => {
    setNotice(msg)

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current)
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice("")
      noticeTimerRef.current = null
    }, 2000)
  }

  React.useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

  React.useEffect(() => {
    if (saveValidationMessage) {
      setSaveValidationMessage("")
    }
  }, [step1, materialStep, planDays])

  const stableInitialPlanDays =
    templateInitialPlanDays ??
    (isEdit ? (Array.isArray(initial?.plan_days) ? initial.plan_days : []) : undefined)

  const { remainingTaskCount } = getPlanSummary({
    range,
    unit_count: unit_countNum,
    rounds: roundsCountNum,
    planDays,
  })

  const handleSave = async () => {
    if (isSaving) return

    const parsed = MaterialEditorSaveSchema.safeParse(
      buildMaterialEditorSaveDraft({
        step1,
        materialStep,
        planDays,
      })
    )

    if (!parsed.success) {
      setSaveValidationMessage(parsed.error.issues[0]?.message ?? "入力内容を確認してください。")
      return
    }

    try {
      setIsSaving(true)
      setSaveValidationMessage("")

      if (isEdit) {
        await updateMaterialAction({
          slug: initial!.edit_slug,
          projectMode: parsed.data.projectMode,
          selectedProjectId: parsed.data.selectedProjectId,
          newProjectName: parsed.data.newProjectName,
          title: parsed.data.title,
          start_date: parsed.data.start_date,
          end_date: parsed.data.end_date,
          unit_type: parsed.data.unit_type,
          unit_count: parsed.data.unit_count,
          rounds: parsed.data.rounds,
          planDays: parsed.data.planDays,
        })
        return
      }

      await saveNewMaterialAction({
        projectMode: parsed.data.projectMode,
        selectedProjectId: parsed.data.selectedProjectId,
        newProjectName: parsed.data.newProjectName,
        title: parsed.data.title,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        unit_type: parsed.data.unit_type,
        unit_count: parsed.data.unit_count,
        rounds: parsed.data.rounds,
        planDays: parsed.data.planDays,
        actualDays: Array.from({ length: parsed.data.planDays.length }, () => 0),
      })
    } catch (e: unknown) {
      if (isRedirectError(e)) {
        throw e
      }

      setSaveValidationMessage(
        e instanceof Error ? e.message : "保存に失敗しました。"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async () => {
    const parsed = MaterialEditorShareSchema.safeParse(
      buildMaterialEditorShareDraft({
        step1,
        materialStep,
        planDays,
      })
    )

    if (!parsed.success) {
      setShareUrl(parsed.error.issues[0]?.message ?? "共有URLの作成に失敗しました")
      setShareOpen(true)
      return
    }

    try {
      const projectName =
        parsed.data.projectMode === "new"
          ? (parsed.data.newProjectName ?? "").trim()
          : (projects.find((p) => String(p.id) === String(parsed.data.selectedProjectId ?? ""))?.name ??
            "").trim()

      const { publicId } = await createTemplateAction({
        projectName,
        title: parsed.data.title,
        unit_type: parsed.data.unit_type,
        unit_count: parsed.data.unit_count,
        rounds: parsed.data.rounds,
        planDays: parsed.data.planDays,
      })

      const url = `${window.location.origin}/material-editor?template=${publicId}`
      setShareUrl(url)
      setShareOpen(true)
    } catch (e: unknown) {
      setShareUrl(e instanceof Error ? e.message : "共有URLの作成に失敗しました")
      setShareOpen(true)
    }
  }

  return (
    <>
      <main className="flex flex-col md:grid md:grid-cols-2 h-full min-h-0">
        <div className="flex-1 min-h-0 md:col-span-1 md:flex-none">
          <MaterialEditorPrimaryPanel
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
            isPlanManuallyChanged={isPlanManuallyChanged}
            onManualPlanChange={() => setIsPlanManuallyChanged(true)}
            remainingTaskCount={remainingTaskCount}
            saveValidationMessage={saveValidationMessage}
            onClearSaveValidationMessage={() => setSaveValidationMessage("")}
          />
        </div>

        <div className="hidden md:flex md:col-span-1 h-full min-h-0">
          {range?.from && range?.to && unit_countNum && roundsCountNum && unitLabelText ? (
            <PlanAdjustCalendar
              range={range}
              unit_count={unit_countNum}
              rounds={roundsCountNum}
              unitLabel={unitLabelText}
              restDays={restDays}
              unit_type={materialStep.unit_type}
              onPlanDaysChange={setPlanDays}
              initialPlanDays={stableInitialPlanDays}
              onShare={handleShare}
              onManualPlanChange={() => setIsPlanManuallyChanged(true)}
            />
          ) : (
            <Card className="w-full m-3 p-12 flex items-center">
              <CardContent className="p-0 gap-2 text-sm text-muted-foreground flex justify-center items-center">
                <NotebookPen />
                教材入力で「開始日 / 終了日 / {unitLabelByType(materialStep.unit_type)}数 / 周回数」を入力してください。
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={openDetails} onOpenChange={setOpenDetails}>
            <SheetContent side="bottom" className="p-0 max-h-[85vh]">
              <SheetHeader className="sr-only">
                <SheetTitle>計画調整</SheetTitle>
              </SheetHeader>

              <div className="h-full p-3 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {range?.from && range?.to && unit_countNum && roundsCountNum && unitLabelText ? (
                    <PlanAdjustCalendar
                      range={range}
                      unit_count={unit_countNum}
                      rounds={roundsCountNum}
                      unitLabel={unitLabelText}
                      restDays={restDays}
                      unit_type={materialStep.unit_type}
                      onPlanDaysChange={setPlanDays}
                      initialPlanDays={stableInitialPlanDays}
                      onShare={handleShare}
                      onManualPlanChange={() => setIsPlanManuallyChanged(true)}
                    />
                  ) : (
                    <Card className="w-full m-3 p-12 flex items-center">
                      <CardContent className="p-0 gap-2 text-sm text-muted-foreground flex justify-center items-center">
                        <NotebookPen />
                        教材入力で「開始日 / 終了日 / {unitLabelByType(materialStep.unit_type)}数 / 周回数」を入力してください。
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </main>

      <PlanShareDialog
        shareUrl={shareUrl}
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        notice={notice}
        showNotice={showNotice}
      />
    </>
  )
}