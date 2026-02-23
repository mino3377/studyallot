// C:\Users\chiso\nextjs\study-allot\src\lib\validators\project.ts
import { z } from "zod"

const trimStr = (v: unknown) => (typeof v === "string" ? v.trim() : v)
const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v

const BaseProject = z.object({
  name: z.preprocess(trimStr, z.string().min(1, "プロジェクト名は必須です。")),
  goal: z.preprocess(trimStr, z.string().max(2000).optional().nullable()),
  notes: z.preprocess(trimStr, z.string().max(4000).optional().nullable()),
})

export const CreateProjectPayload = BaseProject

export const UpdateProjectPayload = BaseProject

export function parseProjectFormData(fd: FormData) {
  return {
    name: String(fd.get("name") ?? ""),
    goal: emptyToNull(fd.get("goal")),
    notes: emptyToNull(fd.get("notes")),
  }
}
