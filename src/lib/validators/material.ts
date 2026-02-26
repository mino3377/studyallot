// src/lib/validators/material.ts
import { z } from "zod";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください");

export function isISODateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function isOverlapByISODate(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  if (
    !isISODateString(aStart) ||
    !isISODateString(aEnd) ||
    !isISODateString(bStart) ||
    !isISODateString(bEnd)
  ) {
    return false;
  }
  const nonOverlap = aEnd < bStart || bEnd < aStart;
  return !nonOverlap;
}

export const PlanSchema = z
  .object({
    name: z.string().min(1),
    start_date: isoDate,
    end_date: isoDate,
    rounds: z.number().int().positive().max(100),
    is_active: z.boolean().optional().default(false),
  })
  .refine((v) => v.start_date <= v.end_date, {
    path: ["start_date"],
    message: "start_date は end_date 以前にしてください",
  });

export function assertNoOverlap(
  plans: Array<{
    name: string;
    start_date: string;
    end_date: string;
    rounds: number;
    is_active?: boolean;
  }>
) {
  const arr = [...plans].sort((a, b) =>
    a.start_date.localeCompare(b.start_date)
  );
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (
        isOverlapByISODate(
          arr[i].start_date,
          arr[i].end_date,
          arr[j].start_date,
          arr[j].end_date
        )
      ) {
        throw new Error(
          `プラン「${arr[i].name}」と「${arr[j].name}」の期間が重複しています。`
        );
      }
    }
  }
}

export function assertExactlyOneActive(
  plans: Array<{ is_active?: boolean }>
) {
  const count = plans.filter((p) => !!p.is_active).length;
  if (count !== 1) {
    throw new Error("アクティブなプランはちょうど1つにしてください。");
  }
}

export const CreateMaterialPayload = z.object({
  title: z.string().min(1),
  total_units: z.number().int().positive().max(200),

  project_id: z.coerce.number().int().positive(),
  section_titles: z.array(z.string()).optional(),
  plans: z.array(PlanSchema).min(1),
});

export const EditMaterialPayload = z
  .object({
    title: z.string().min(1),
    start_date: isoDate,
    end_date: isoDate,
    total_units: z.number().int().positive().max(200),
    rounds: z.number().int().positive().max(100),
    project_id: z.coerce.number().int().positive(),
    section_titles: z.array(z.string()).optional(),
  })
  .refine((v) => v.start_date <= v.end_date, {
    path: ["start_date"],
    message: "start_date は end_date 以前にしてください",
  });
