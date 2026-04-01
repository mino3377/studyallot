// C:\Users\chiso\nextjs\study-allot\src\lib\validators\project.ts
import { z } from "zod"
import { title } from "../constant/project-constant"

export const projectBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(title.min, `プロジェクト名は${title.min}文字以上にしてください`)
    .max(title.max, `プロジェクト名は${title.max}文字以下にしてください`),
})