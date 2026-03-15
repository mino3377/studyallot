// src/lib/validators/material.ts
import { z } from "zod"
import { UNIT_TYPE_IDS } from "../type/unit-type"

export const MaterialBaseSchema = z.object({
  title: z
    .string()
    .min(1, "教材名は1文字以上入力してください")
    .max(50, "教材名は50文字以内にしてください"),

  start_date: z.date({
    error: "開始日を選択してください",
  }),

  end_date: z.date({
    error: "終了日を選択してください",
  }),

  unit_type: z.enum(UNIT_TYPE_IDS, {
    error: () => ({ message: "区切りの呼び方を選択してください" }),
  }),

  unit_count: z
    .number({
      error: "区切り数を入力してください",
    })
    .int("区切り数は整数で入力してください")
    .min(1, "区切り数は1以上にしてください")
    .max(999, "区切り数は999以下にしてください"),

  rounds: z
    .number({
      error: "周回数を入力してください",

    })
    .int("周回数は整数で入力してください")
    .min(1, "周回数は1以上にしてください")
    .max(999, "周回数は999以下にしてください"),
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

export const MaterialSchema = MaterialBaseSchema.refine(
  (data) => data.start_date.getTime() <= data.end_date.getTime(),
  {
    message: "終了日は開始日以後にしてください",
    path: ["end_date"],
  }
)