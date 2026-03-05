"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { useSearchParams } from "next/navigation"

import { type Step } from "./_components/material-editor-step-nav"
import {
  type ProjectOption,
  type ProjectSelectStepValue,
} from "./_components/project-select-step"
import { type MaterialRegisterValue } from "./_components/material-register-step"

import NewAddPrimaryPanel from "./_components/material-editor-primary-panel"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import PlanAdjustCalendarPanel from "./_components/plan-adjust-calendar"

import { saveNewMaterialAction, updateMaterialAction } from "./actions"
import { unitLabel as unitTypeLabel } from "@/lib/type/unit-type"

import { createTemplateAction, fetchTemplateAction } from "./template-actions"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

  const [restDays, setRestDays] = React.useState<Set<number>>(() => new Set<number>())
  const [openDetails, setOpenDetails] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const [currentStep, setCurrentStep] = React.useState<Step>(() => (isEdit ? 2 : 1))
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
    materialStep.laps && Number(materialStep.laps) > 0 ? Number(materialStep.laps) : undefined

  const unitLabelText = unitTypeLabel(materialStep.unitType)

  const [shareOpen, setShareOpen] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState("")

  const [notice, setNotice] = React.useState<string>("")
  const noticeTimerRef = React.useRef<number | null>(null)

  const appliedRef = React.useRef<string | null>(null)

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
        const n = Array.isArray(t.planDays) ? t.planDays.length : 0
        const end = addDays(today, Math.max(0, n - 1))

        setMaterialStep({
          title: t.title ?? "",
          startDate: today,
          endDate: end,
          unitType: (t.unitType as any) ?? "section",
          unitCount: String(t.unitCount ?? ""),
          laps: String(t.rounds ?? ""),
        })

        setPlanDays(Array.isArray(t.planDays) ? t.planDays : [])
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

    const s = planDays.reduce((a, b) => a + b, 0)
    if (s !== totalTasks) return

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

    const totalTasks = unitCountNum * lapsNum
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

  const stableInitialPlanDays = isEdit
    ? (Array.isArray(initial?.planDays) ? initial!.planDays! : [])
    : undefined

  return (
    <>
      <main className="flex flex-col md:grid md:grid-cols-2 h-full min-h-0">
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

        <div className="hidden md:flex md:col-span-1 h-full min-h-0">
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
              onShare={handleShare}
            />
          ) : null}
        </div>

        <div className="md:hidden">
          <Sheet open={openDetails} onOpenChange={setOpenDetails}>
            <SheetContent side="bottom" className="p-0 max-h-[85vh]">
              <SheetHeader className="sr-only">
                <SheetTitle>計画調整</SheetTitle>
              </SheetHeader>

              <div className="h-[85vh] p-3 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto">
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
                      onShare={handleShare}
                    />
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </main>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>共有URL</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
            <Input readOnly value={shareUrl} />
            <Button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl)
                  showNotice("コピーしました")
                } catch {
                  showNotice("コピーに失敗しました（手動で選択してコピーしてください）")
                }
              }}
            >
              コピー
            </Button>
            {notice ? (
              <div className="text-xs text-muted-foreground">{notice}</div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}