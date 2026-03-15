import type { DateRange } from "react-day-picker"
import { eachDayOfInterval } from "date-fns"
import { iso } from "@/lib/date/date"

type Step1Input = {
  mode: "existing" | "new"
  selectedProjectId?: string
  newProjectName?: string
}

type MaterialStepInput = {
  title: string
  start_date?: Date
  end_date?: Date
  unit_type: string
  unit_count: string
  rounds: string
}

function toPositiveInt(value: string): number | undefined {
  const n = Number(value)
  if (value === "" || !Number.isInteger(n) || n <= 0) return undefined
  return n
}

export function buildMaterialEditorSaveDraft(args: {
  step1: Step1Input
  materialStep: MaterialStepInput
  planDays: number[]
}) {
  const { step1, materialStep, planDays } = args

  return {
    projectMode: step1.mode,
    selectedProjectId: step1.selectedProjectId ?? "",
    newProjectName: step1.newProjectName ?? "",
    title: materialStep.title.trim(),
    start_date: materialStep.start_date ? iso(materialStep.start_date) : "",
    end_date: materialStep.end_date ? iso(materialStep.end_date) : "",
    unit_type: materialStep.unit_type,
    unit_count: toPositiveInt(materialStep.unit_count),
    rounds: toPositiveInt(materialStep.rounds),
    planDays: Array.isArray(planDays) ? planDays : [],
  }
}

export function buildMaterialEditorShareDraft(args: {
  step1: Step1Input
  materialStep: MaterialStepInput
  planDays: number[]
}) {
  const { step1, materialStep, planDays } = args

  return {
    projectMode: step1.mode,
    selectedProjectId: step1.selectedProjectId ?? "",
    newProjectName: step1.newProjectName ?? "",
    title: materialStep.title.trim(),
    unit_type: materialStep.unit_type,
    unit_count: toPositiveInt(materialStep.unit_count),
    rounds: toPositiveInt(materialStep.rounds),
    planDays: Array.isArray(planDays) ? planDays : [],
  }
}

export function getPlanSummary(args: {
  range?: DateRange
  unit_count?: number
  rounds?: number
  planDays: number[]
}) {
  const { range, unit_count, rounds, planDays } = args

  const totalTasks =
    unit_count != null && rounds != null && unit_count > 0 && rounds > 0
      ? unit_count * rounds
      : 0

  const dayCount =
    range?.from && range?.to
      ? eachDayOfInterval({ start: range.from, end: range.to }).length
      : 0

  const hasTaskInputs = !!unit_count && !!rounds && dayCount > 0
  const isPlanCountReady = hasTaskInputs && planDays.length === dayCount

  const assignedTaskCount = isPlanCountReady ? planDays.reduce((sum, n) => sum + n, 0) : 0
  const remainingTaskCount = isPlanCountReady ? totalTasks - assignedTaskCount : null

  return {
    totalTasks,
    dayCount,
    hasTaskInputs,
    isPlanCountReady,
    assignedTaskCount,
    remainingTaskCount,
  }
}