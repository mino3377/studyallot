// src/lib/validators/material.ts
import { z } from "zod"
import { UNIT_TYPE_IDS } from "../type/unit-type"
import { rounds, title, unitCount } from "../constant/material-constant"

export const MaterialBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(title.min, `教材名は${title.min}以上にしてください`)
    .max(title.max, `教材名は${title.max}以下にしてください`),
  project: z
    .string()
    .min(1, "プロジェクトを選択してください"),

  start_date: z.date({
    error: "開始日を選択してください",
  }),

  end_date: z.date({
    error: "終了日を選択してください",
  }),

  unit_type: z.enum(UNIT_TYPE_IDS, {
    error: "タイプを選択してください",
  }),

  unit_count: z
    .number({
      error: "ユニット数を入力してください",
    })
    .int("ユニット数は整数で入力してください")
    .min(unitCount.min, `ユニット数は${unitCount.min}以上にしてください`)
    .max(unitCount.max, `ユニット数は${unitCount.max}以下にしてください`),

  rounds: z
    .number({
      error: "周回数を入力してください",

    })
    .int("周回数は整数で入力してください")
    .min(rounds.min, `周回数は${rounds.min}以上にしてください`)
    .max(rounds.max, `周回数は${rounds.max}以下にしてください`),
})



export const MaterialDateRangeSchema = z
  .object({
    start_date: MaterialBaseSchema.shape.start_date,
    end_date: MaterialBaseSchema.shape.end_date,
  })
  .refine((data) => data.start_date.getTime() <= data.end_date.getTime(), {
    message: "終了日は開始日以後にしてください",
    path: ["end_date"],
  })