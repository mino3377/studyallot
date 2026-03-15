import { z } from "zod"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "開始日と終了日を入力してください。")

export const MaterialEditorSaveSchema = z
  .object({
    projectMode: z.enum(["existing", "new"]),
    selectedProjectId: z.string().optional(),
    newProjectName: z.string().optional(),

    title: z.string().min(1, "教材名を入力してください。"),

    start_date: isoDate,
    end_date: isoDate,

    unit_type: z.string(),

    unit_count: z.number(),
    rounds: z.number(),

    planDays: z.array(z.number().int().min(0)),
  })
  .superRefine((v, ctx) => {
    if (v.projectMode === "existing" && !v.selectedProjectId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["selectedProjectId"],
        message: "プロジェクトを選択してください。",
      })
    }

    if (v.projectMode === "new" && !v.newProjectName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["newProjectName"],
        message: "プロジェクト名を入力してください。",
      })
    }

    if (!Number.isInteger(v.unit_count) || v.unit_count <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["unit_count"],
        message: "区切り数を入力してください。",
      })
    } else if (v.unit_count >= 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["unit_count"],
        message: "区切り数は1000未満にしてください。",
      })
    }

    if (!Number.isInteger(v.rounds) || v.rounds <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds"],
        message: "周回数を入力してください。",
      })
    } else if (v.rounds >= 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds"],
        message: "周回数は1000未満にしてください。",
      })
    }

    if (v.start_date > v.end_date) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "開始日は終了日以前にしてください。",
      })
    }

    if (v.planDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["planDays"],
        message: "カレンダーでタスク配分を完了してください。",
      })
      return
    }

    const start = new Date(`${v.start_date}T00:00:00`)
    const end = new Date(`${v.end_date}T00:00:00`)

    const dayCount =
      Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1

    if (dayCount <= 0 || v.planDays.length !== dayCount) {
      ctx.addIssue({
        code: "custom",
        path: ["planDays"],
        message: "カレンダーでタスク配分を完了してください。",
      })
      return
    }

    const totalTasks = v.unit_count * v.rounds
    const sumPlanDays = v.planDays.reduce((sum, n) => sum + n, 0)

    if (sumPlanDays < totalTasks) {
      ctx.addIssue({
        code: "custom",
        path: ["planDays"],
        message: `タスク配分が ${totalTasks - sumPlanDays} 個不足しています。`,
      })
    }

    if (sumPlanDays > totalTasks) {
      ctx.addIssue({
        code: "custom",
        path: ["planDays"],
        message: `タスク配分が ${sumPlanDays - totalTasks} 個超過しています。`,
      })
    }
  })

export const MaterialEditorShareSchema = z
  .object({
    projectMode: z.enum(["existing", "new"]),
    selectedProjectId: z.string().optional(),
    newProjectName: z.string().optional(),

    title: z.string().min(1, "教材名を入力してください"),
    unit_type: z.string(),

    unit_count: z.number(),
    rounds: z.number(),

    planDays: z.array(z.number().int().min(0)),
  })
  .superRefine((v, ctx) => {
    if (!Number.isInteger(v.unit_count) || v.unit_count <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["unit_count"],
        message: "区切り数 / 周回数を入力してください",
      })
    }

    if (!Number.isInteger(v.rounds) || v.rounds <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds"],
        message: "区切り数 / 周回数を入力してください",
      })
    }

    if (v.unit_count >= 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["unit_count"],
        message: "区切り数は1000未満にしてください。",
      })
    }

    if (v.rounds >= 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds"],
        message: "周回数は1000未満にしてください。",
      })
    }

    if (!v.title.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "教材名を入力してください",
      })
    }

    if (v.planDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["planDays"],
        message: "計画が未作成です（カレンダーで配分してください）",
      })
      return
    }

    const totalTasks = v.unit_count * v.rounds
    const sumPlanDays = v.planDays.reduce((sum, n) => sum + n, 0)

    if (sumPlanDays !== totalTasks) {
      ctx.addIssue({
        code: "custom",
        path: ["planDays"],
        message: `計画合計が一致しません（計画:${sumPlanDays} / 総タスク:${totalTasks}）`,
      })
    }
  })