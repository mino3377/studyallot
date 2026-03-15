//C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\template-actions.ts

"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { makePublicId } from "@/lib/slug"
import { unit_type } from "@/lib/type/unit-type"

export type CreateTemplateInput = {
  projectName?: string
  title: string
  unit_type: string
  unit_count: number
  rounds: number
  planDays: number[]
}

export async function createTemplateAction(input: CreateTemplateInput) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const userId = auth.user.id

  const publicId = makePublicId("t")

  const { error } = await supabase.from("templates").insert({
    user_id: userId,
    public_id: publicId,
    project_name: (input.projectName ?? "").trim(),
    title: input.title.trim(),
    unit_type: input.unit_type,
    unit_count: input.unit_count,
    rounds: input.rounds,
    plan_days: input.planDays,
  })

  if (error) throw new Error(error.message)

  return { publicId }
}

export async function fetchTemplateAction(publicId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("templates")
    .select("public_id, project_name, title, unit_type, unit_count, rounds, plan_days")
    .eq("public_id", publicId)
    .single()

  if (error) throw new Error(error.message)

  return {
    publicId: data.public_id as string,
    projectName: (data.project_name ?? "") as string,
    title: data.title as string,
    unit_type: data.unit_type as unit_type,
    unit_count: Number(data.unit_count),
    rounds: Number(data.rounds),
    planDays: (data.plan_days ?? []) as number[],
  }
}