import { z } from "zod"

export const CreateProjectPayload = z.object({
  name: z.string().min(1),
  purpose: z.enum(["language","exam","license","research","hobby","other","skill","reading","test"]),
  goal: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  weeklyHours: z.coerce.number().int().min(0).max(168).default(0),
  // 使うなら: toDate: z.string().min(1).optional().nullable(),
})

export const UpdateProjectPayload = z.object({
  name: z.string().min(1),
  purpose: z.enum(["language","exam","license","research","hobby","other","skill","reading","test"]),
  goal: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  weeklyHours: z.coerce.number().int().min(0).max(168).nullable(),
})
