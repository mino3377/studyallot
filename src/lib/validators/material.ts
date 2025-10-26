// src/lib/validators/material.ts
import { z } from "zod";

// 共通: プラン
export const PlanSchema = z.object({
  name: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  rounds: z.number().int().positive().max(100),
  is_active: z.boolean().optional().default(false),
});

// 新規作成
export const CreateMaterialPayload = z.object({
  title: z.string().min(1),
  source_type: z.enum(["book", "video", "paper", "web", "other"]),
  author: z.string().optional().nullable(),
  link: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  total_units: z.number().int().positive().max(200),
  project_id: z.coerce.number().int().positive(),
  section_titles: z.array(z.string()).optional(),
  plans: z.array(PlanSchema).min(1),
});

// 編集（単一プラン更新を想定）
export const EditMaterialPayload = z.object({
  title: z.string().min(1),
  source_type: z.enum(["book", "video", "paper", "web", "other"]),
  author: z.string().optional().nullable(),
  link: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  total_units: z.number().int().positive().max(200),
  rounds: z.number().int().positive().max(100),
  project_id: z.coerce.number().int().positive(),
  section_titles: z.array(z.string()).optional(),
});
