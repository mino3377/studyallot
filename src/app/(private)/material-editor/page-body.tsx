//C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\page-body.tsx
"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { useSearchParams } from "next/navigation"
import { addDays } from "date-fns"
import { NotebookPen } from "lucide-react"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import type { Step } from "./_components/primary-panel/material-editor-step-nav"

import MaterialEditorPrimaryPanel from "./_components/primary-panel/material-editor-primary-panel"
import PlanAdjustCalendar from "./_components/plan-adjust-calendar"
import { PlanShareDialog } from "./_components/plan-share-dialog"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"

import { saveNewMaterialAction, updateMaterialAction } from "./actions"
import { createTemplateAction, fetchTemplateAction } from "./template-actions"

import { unit_type, unitLabel as unit_typeLabel } from "@/lib/type/unit-type"
import { unitLabelByType } from "@/lib/unit-wording"
import type {
  MaterialRegisterValue,
  MaterialRow,
  UpdateMaterialInput,
  ProjectOption,
} from "@/lib/type/material_type"

import { ProjectRow } from "@/lib/type/project_type"
import { iso } from "@/lib/date/date"
import { MaterialSchema } from "@/lib/validators/material"

function buildMaterialEditorSaveDraft(args: {
  step1: UpdateMaterialInput
  materialStep: MaterialRegisterValue
  planDays: number[]
}) {
  return {
    projectMode: args.step1.projectMode,
    selectedProjectId: args.step1.selectedProjectId,
    newProjectName: args.step1.newProjectName ?? "",
    title: args.materialStep.title,
    start_date: args.materialStep.start_date
      ? new Date(args.materialStep.start_date)
      : undefined,
    end_date: args.materialStep.end_date
      ? new Date(args.materialStep.end_date)
      : undefined,
    unit_type: args.materialStep.unit_type,
    unit_count: args.materialStep.unit_count,
    rounds: args.materialStep.rounds,
    planDays: args.planDays,
  }
}

function buildMaterialEditorShareDraft(args: {
  step1: UpdateMaterialInput
  materialStep: MaterialRegisterValue
  planDays: number[]
}) {
  return buildMaterialEditorSaveDraft(args)
}

function getPlanSummary(args: {
  range?: { from?: string; to?: string }
  unit_count?: number
  rounds?: number
  planDays: number[]
}) {
  if (!args.range?.from || !args.range?.to || !args.unit_count || !args.rounds) {
    return { remainingTaskCount: null }
  }

  const total = args.unit_count * args.rounds
  const planned = args.planDays.reduce((sum, n) => sum + n, 0)

  return {
    remainingTaskCount: total - planned,
  }
}

export default function MaterialEditorPageBody({
  projects,
  initial,
}: {
  projects: ProjectRow[]
  initial?: MaterialRow & { edit_slug: string }
}) {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const isTemplateMode = !!templateId
  const isEdit = !!initial?.edit_slug && !isTemplateMode

  const [step1, setStep1] = React.useState<UpdateMaterialInput>({
    projectMode: "existing",
    selectedProjectId: initial?.project_id,
    newProjectName: "",
  })

  const [materialStep, setMaterialStep] = React.useState<MaterialRegisterValue>({
    title: initial?.title ?? "",
    start_date: initial?.start_date ?? undefined,
    end_date: initial?.end_date ?? undefined,
    unit_type: initial?.unit_type ?? "section",
    unit_count: initial?.unit_count ?? 0,
    rounds: initial?.rounds ?? 0,
  })

  const [planDays, setPlanDays] = React.useState<number[]>(
    Array.isArray(initial?.plan_days) ? initial.plan_days : []
  )

  const [templateInitialPlanDays, setTemplateInitialPlanDays] = React.useState<
    number[] | undefined
  >(undefined)

  const [restDays, setRestDays] = React.useState<Set<number>>(new Set())
  const [openDetails, setOpenDetails] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveValidationMessage, setSaveValidationMessage] = React.useState("")
  const [currentStep, setCurrentStep] = React.useState<Step>(isEdit ? 2 : 1)

  const [shareOpen, setShareOpen] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const [isPlanManuallyChanged, setIsPlanManuallyChanged] = React.useState(false)

  const noticeTimerRef = React.useRef<number | null>(null)
  const appliedTemplateIdRef = React.useRef<string | null>(null)

  const goStep2 = () => setCurrentStep(2)


  //テンプレート
  React.useEffect(() => {
    if (!templateId) return
    if (appliedTemplateIdRef.current === templateId) return

    appliedTemplateIdRef.current = templateId

    const applyTemplate = async () => {
      const t = await fetchTemplateAction(templateId)

      const projectName = t.projectName.trim()

      //テンプレートプロジェクト名あり
      if (projectName) {
        const matchedProject = projects.find((p) => p.name === projectName)
        //同じプロジェクト名があればそれに設定
        if (matchedProject) {
          setStep1({
            projectMode: "existing",
            selectedProjectId: matchedProject.id,
            newProjectName: "",
          })
        } else {
          //なければ新たに作成
          setStep1({
            projectMode: "new",
            selectedProjectId: undefined,
            newProjectName: projectName,
          })
        }
        //テンプレートプロジェクト名なし
      } else {
        setStep1({
          projectMode: "new",
          selectedProjectId: undefined,
          newProjectName: "",
        })
      }

      const today = new Date()
      const nextPlanDays = t.planDays
      const endDate = addDays(today, Math.max(0, nextPlanDays.length - 1))

      setMaterialStep({
        title: t.title,
        start_date: iso(today),
        end_date: iso(endDate),
        unit_type: t.unit_type,
        unit_count: t.unit_count,
        rounds: t.rounds,
      })

      setPlanDays(nextPlanDays)
      setTemplateInitialPlanDays(nextPlanDays)
      setCurrentStep(2)
    }

    void applyTemplate()
  }, [templateId, projects])

  React.useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (saveValidationMessage) {
      setSaveValidationMessage("")
    }
  }, [step1, materialStep, planDays])

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

  const range =
    materialStep.start_date && materialStep.end_date
      ? { from: materialStep.start_date, to: materialStep.end_date }
      : undefined

  const unitCountNum =
    typeof materialStep.unit_count === "number" && materialStep.unit_count > 0
      ? materialStep.unit_count
      : undefined

  const roundsCountNum =
    typeof materialStep.rounds === "number" && materialStep.rounds > 0
      ? materialStep.rounds
      : undefined

  const unitLabelText = unit_typeLabel(materialStep.unit_type)

  const initialPlanDays =
    templateInitialPlanDays ?? (isEdit ? initial?.plan_days : undefined)

  const { remainingTaskCount } = getPlanSummary({
    range,
    unit_count: unitCountNum,
    rounds: roundsCountNum,
    planDays,
  })

  const handleSave = async () => {
    if (isSaving) return

    const draft = buildMaterialEditorSaveDraft({
      step1,
      materialStep,
      planDays,
    })

    if (draft.projectMode === "existing" && !draft.selectedProjectId) {
      setSaveValidationMessage("既存プロジェクトを選択してください")
      return
    }

    if (draft.projectMode === "new" && !draft.newProjectName.trim()) {
      setSaveValidationMessage("新しいプロジェクト名を入力してください")
      return
    }

    const parsed = MaterialSchema.safeParse({
      title: draft.title,
      start_date: draft.start_date,
      end_date: draft.end_date,
      unit_type: draft.unit_type,
      unit_count: draft.unit_count,
      rounds: draft.rounds,
    })

    if (!parsed.success) {
      setSaveValidationMessage(
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。"
      )
      return
    }

    try {
      setIsSaving(true)
      setSaveValidationMessage("")

      if (isEdit && initial) {
        await updateMaterialAction({
          slug: initial.edit_slug,
          projectMode: draft.projectMode,
          selectedProjectId: draft.selectedProjectId,
          newProjectName: draft.newProjectName,
          title: parsed.data.title,
          start_date: iso(parsed.data.start_date),
          end_date: iso(parsed.data.end_date),
          unit_type: parsed.data.unit_type,
          unit_count: parsed.data.unit_count,
          rounds: parsed.data.rounds,
          planDays: draft.planDays,
        })
        return
      }

      await saveNewMaterialAction({
        projectMode: draft.projectMode,
        selectedProjectId: draft.selectedProjectId,
        newProjectName: draft.newProjectName,
        title: parsed.data.title,
        start_date: iso(parsed.data.start_date),
        end_date: iso(parsed.data.end_date),
        unit_type: parsed.data.unit_type,
        unit_count: parsed.data.unit_count,
        rounds: parsed.data.rounds,
        planDays: draft.planDays,
        actualDays: Array.from({ length: draft.planDays.length }, () => 0),
      })
    } catch (e: unknown) {
      if (isRedirectError(e)) throw e

      setSaveValidationMessage(
        e instanceof Error ? e.message : "保存に失敗しました。"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async () => {
    const draft = buildMaterialEditorShareDraft({
      step1,
      materialStep,
      planDays,
    })

    if (draft.projectMode === "existing" && !draft.selectedProjectId) {
      setShareUrl("既存プロジェクトを選択してください")
      setShareOpen(true)
      return
    }

    if (draft.projectMode === "new" && !draft.newProjectName.trim()) {
      setShareUrl("新しいプロジェクト名を入力してください")
      setShareOpen(true)
      return
    }

    const parsed = MaterialSchema.safeParse({
      title: draft.title,
      start_date: draft.start_date,
      end_date: draft.end_date,
      unit_type: draft.unit_type,
      unit_count: draft.unit_count,
      rounds: draft.rounds,
    })

    if (!parsed.success) {
      setShareUrl(parsed.error.issues[0]?.message ?? "共有URLの作成に失敗しました")
      setShareOpen(true)
      return
    }

    try {
      const projectName =
        draft.projectMode === "new"
          ? draft.newProjectName.trim()
          : (
            projects.find((p) => Number(p.id) === draft.selectedProjectId)?.name ?? ""
          ).trim()

      const { publicId } = await createTemplateAction({
        projectName,
        title: parsed.data.title,
        unit_type: parsed.data.unit_type,
        unit_count: parsed.data.unit_count,
        rounds: parsed.data.rounds,
        planDays: draft.planDays,
      })

      setShareUrl(`${window.location.origin}/material-editor?template=${publicId}`)
      setShareOpen(true)
    } catch (e: unknown) {
      setShareUrl(e instanceof Error ? e.message : "共有URLの作成に失敗しました")
      setShareOpen(true)
    }
  }

  const canShowCalendar =
    !!range?.from && !!range?.to && !!unitCountNum && !!roundsCountNum && !!unitLabelText

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
          {canShowCalendar ? (
            <PlanAdjustCalendar
              range={range}
              unit_count={unitCountNum}
              rounds={roundsCountNum}
              unitLabel={unitLabelText}
              restDays={restDays}
              unit_type={materialStep.unit_type}
              onPlanDaysChange={setPlanDays}
              initialPlanDays={initialPlanDays}
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
                  {canShowCalendar ? (
                    <PlanAdjustCalendar
                      range={range}
                      unit_count={unitCountNum}
                      rounds={roundsCountNum}
                      unitLabel={unitLabelText}
                      restDays={restDays}
                      unit_type={materialStep.unit_type}
                      onPlanDaysChange={setPlanDays}
                      initialPlanDays={initialPlanDays}
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