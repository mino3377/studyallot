import z from "zod";
import { content, studyTime, taskCount } from "../constant/material-constant";

export const CheckSheetSchema = z.object({
    date: z.date({
        error: "日付を選択してください"
    }),

    task_count: z
        .number()
        .min(taskCount.min, `タスク数は${taskCount.min}以上にしてください`)
        .max(taskCount.max, `タスク数は${taskCount.max}以下にしてください`),

    study_time: z
        .number()
        .min(studyTime.min, `学習時間は${studyTime.min}分以上にしてください`)
        .max(studyTime.max, `学習時間は${studyTime.max}分以下にしてください`),

    study_content: z
        .string()
        .max(content.max, `内容は${content.max}文字以下にしてください`),
})