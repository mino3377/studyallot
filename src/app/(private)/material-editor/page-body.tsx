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
import { unitLabel as unitTypeLabel } from "@/lib/type/unit-type"

import { createTemplateAction, fetchTemplateAction } from "./template-actions"
import { addDays, eachDayOfInterval, format } from "date-fns"
import { PlanShareDialog } from "./_components/plan-share-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { NotebookPen } from "lucide-react"
import { unitLabelByType } from "@/lib/unit-wording"

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
    unitCount: number
    laps?: number
    planDays?: number[]
  }
}) {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const isTemplateMode = !!templateId
  const isEdit = !!initial?.editSlug && !isTemplateMode

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
    materialStep.startDate && materialStep.endDate
      ? { from: materialStep.startDate, to: materialStep.endDate }
      : undefined

  const rawUnitCount = Number(materialStep.unitCount)
  const unitCountNum =
    materialStep.unitCount !== "" && Number.isInteger(rawUnitCount) && rawUnitCount > 0
      ? rawUnitCount
      : undefined

  const rawLaps = Number(materialStep.laps)
  const lapsNum =
    materialStep.laps !== "" && Number.isInteger(rawLaps) && rawLaps > 0 ? rawLaps : undefined

  const unitLabelText = unitTypeLabel(materialStep.unitType)

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

    ;(async () => {
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
      const n = fetchedPlanDays.length
      const end = addDays(today, Math.max(0, n - 1))

      setMaterialStep({
        title: t.title ?? "",
        startDate: today,
        endDate: end,
        unitType: (t.unitType as any) ?? "section",
        unitCount: String(t.unitCount ?? ""),
        laps: String(t.rounds ?? ""),
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
    (isEdit ? (Array.isArray(initial?.planDays) ? initial.planDays : []) : undefined)

  const totalTasks =
    unitCountNum != null && lapsNum != null && unitCountNum > 0 && lapsNum > 0
      ? unitCountNum * lapsNum
      : 0

  const dayCount =
    range?.from && range?.to
      ? eachDayOfInterval({ start: range.from, end: range.to }).length
      : 0

  const hasTaskInputs = !!unitCountNum && !!lapsNum && dayCount > 0
  const isPlanCountReady = hasTaskInputs && planDays.length === dayCount

  const assignedTaskCount = isPlanCountReady ? planDays.reduce((sum, n) => sum + n, 0) : 0

  const remainingTaskCount = isPlanCountReady ? totalTasks - assignedTaskCount : null

  const getSaveValidationMessage = () => {
    if (step1.mode === "existing" && !String(step1.selectedProjectId ?? "").trim()) {
      return "プロジェクトを選択してください。"
    }

    if (step1.mode === "new" && !String(step1.newProjectName ?? "").trim()) {
      return "プロジェクト名を入力してください。"
    }

    if (!materialStep.title.trim()) {
      return "教材名を入力してください。"
    }

    const startISO = fmtISODate(materialStep.startDate)
    const endISO = fmtISODate(materialStep.endDate)

    if (!startISO || !endISO) {
      return "開始日と終了日を入力してください。"
    }

    if (!unitCountNum) {
      return `${unitLabelText}数を入力してください。`
    }

    if (!lapsNum) {
      return "周回数を入力してください。"
    }

    if (unitCountNum >= 1000) {
      return `${unitLabelText}数は1000未満にしてください。`
    }

    if (lapsNum >= 1000) {
      return "周回数は1000未満にしてください。"
    }

    if (!planDays.length || !isPlanCountReady) {
      return "カレンダーでタスク配分を完了してください。"
    }

    const sumPlanDays = planDays.reduce((a, b) => a + b, 0)

    if (remainingTaskCount != null && remainingTaskCount !== 0) {
      return remainingTaskCount > 0
        ? `タスク配分が ${remainingTaskCount} 個不足しています。`
        : `タスク配分が ${Math.abs(remainingTaskCount)} 個超過しています。`
    }

    if (sumPlanDays !== totalTasks) {
      return `タスク配分合計が一致していません。（計画:${sumPlanDays} / 総タスク:${totalTasks}）`
    }

    return ""
  }

  const handleSave = async () => {
    if (isSaving) return

    const validationMessage = getSaveValidationMessage()
    if (validationMessage) {
      setSaveValidationMessage(validationMessage)
      return
    }

    const startISO = fmtISODate(materialStep.startDate)
    const endISO = fmtISODate(materialStep.endDate)

    try {
      setIsSaving(true)
      setSaveValidationMessage("")

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
          unitCount: unitCountNum!,
          rounds: lapsNum!,
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
        unitCount: unitCountNum!,
        rounds: lapsNum!,
        planDays,
        actualDays: Array.from({ length: planDays.length }, () => 0),
      })
    } catch (e: any) {
      setSaveValidationMessage(e?.message ?? "保存に失敗しました。")
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async () => {
    if (!materialStep.title.trim()) {
      setShareUrl("教材名を入力してください")
      setShareOpen(true)
      return
    }
    if (!unitCountNum || !lapsNum) {
      setShareUrl("区切り数 / 周回数を入力してください")
      setShareOpen(true)
      return
    }
    if (!planDays.length) {
      setShareUrl("計画が未作成です（カレンダーで配分してください）")
      setShareOpen(true)
      return
    }

    const s = planDays.reduce((a, b) => a + b, 0)
    if (s !== totalTasks) {
      setShareUrl(`計画合計が一致しません（計画:${s} / 総タスク:${totalTasks}）`)
      setShareOpen(true)
      return
    }

    try {
      const projectName =
        step1.mode === "new"
          ? (step1.newProjectName ?? "").trim()
          : (projects.find((p) => String(p.id) === String(step1.selectedProjectId ?? ""))?.name ??
              "").trim()

      const { publicId } = await createTemplateAction({
        projectName,
        title: materialStep.title.trim(),
        unitType: materialStep.unitType,
        unitCount: unitCountNum,
        rounds: lapsNum,
        planDays,
      })

      const url = `${window.location.origin}/material-editor?template=${publicId}`
      setShareUrl(url)
      setShareOpen(true)
    } catch (e: any) {
      setShareUrl(e?.message ?? "共有URLの作成に失敗しました")
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
          {range?.from && range?.to && unitCountNum && lapsNum && unitLabelText ? (
            <PlanAdjustCalendar
              range={range}
              unitCount={unitCountNum}
              laps={lapsNum}
              unitLabel={unitLabelText}
              restDays={restDays}
              unitType={materialStep.unitType}
              onPlanDaysChange={setPlanDays}
              initialPlanDays={stableInitialPlanDays}
              onShare={handleShare}
              onManualPlanChange={() => setIsPlanManuallyChanged(true)}
            />
          ) : (
            <Card className="w-full m-3 p-12 flex items-center">
              <CardContent className="p-0 gap-2 text-sm text-muted-foreground flex justify-center items-center">
                <NotebookPen />
                教材入力で「開始日 / 終了日 / {unitLabelByType(materialStep.unitType)}数 / 周回数」を入力してください。
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
                  {range?.from && range?.to && unitCountNum && lapsNum && unitLabelText ? (
                    <PlanAdjustCalendar
                      range={range}
                      unitCount={unitCountNum}
                      laps={lapsNum}
                      unitLabel={unitLabelText}
                      restDays={restDays}
                      unitType={materialStep.unitType}
                      onPlanDaysChange={setPlanDays}
                      initialPlanDays={stableInitialPlanDays}
                      onShare={handleShare}
                      onManualPlanChange={() => setIsPlanManuallyChanged(true)}
                    />
                  ) : (
                    <Card className="w-full m-3 p-12 flex items-center">
                      <CardContent className="p-0 gap-2 text-sm text-muted-foreground flex justify-center items-center">
                        <NotebookPen />
                        教材入力で「開始日 / 終了日 / {unitLabelByType(materialStep.unitType)}数 / 周回数」を入力してください。
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