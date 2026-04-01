import { Project } from "@/lib/type/project_type"
import { createClient } from "@/utils/supabase/server"

export async function fetchProjectIdsAndOrders(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, order")
    .eq("user_id", userId)
    .order("order", { ascending: true, nullsFirst: true })

  if (error) throw new Error("プロジェクトの取得に失敗しました")

  return (data ?? []) as Project[]
}

export type RecordTask = {
  id: number
  material_id:number
  date: Date
  task_count: number
  study_time: number
  study_content: string
}

export async function fetchRecordRows(
  userId: string,
): Promise<RecordTask[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("records")
    .select("id, material_id ,date, task_count, study_time, study_content")
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((record) => ({
    id: record.id,
    material_id:record.material_id,
    date: new Date(record.date),
    task_count: record.task_count,
    study_time: record.study_time,
    study_content: record.study_content ?? "",
  }))
}