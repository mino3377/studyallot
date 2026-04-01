"use server"

import { createClient } from "@/utils/supabase/server"

export type RecordRow = {
    id: number
    date: string
    task_count: string
    study_time: string
    study_content: string
}

export async function getMaterialRecordRows(
    userId: string,
    materialId: number
): Promise<RecordRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("records")
        .select("id, date, task_count, study_time, study_content")
        .eq("user_id", userId)
        .eq("material_id", materialId)

    if (error) throw new Error(error.message)
    if (!data) return []

    return data.map((record) => ({
        id: record.id,
        date: record.date,
        task_count: String(record.task_count),
        study_time: String(record.study_time),
        study_content: record.study_content ?? "",
    }))
}