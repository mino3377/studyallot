"use server"

import { CheckSheetSchema } from "@/lib/validators/record"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveRecord(materialId: number, formData: FormData) {
    const rowData = {
        date: new Date(String(formData.get("date") ?? "")),
        task_count: Number(formData.get("task_count") ?? 0),
        study_time: Number(formData.get("study_time") ?? 0),
        study_content: String(formData.get("study_content") ?? ""),
    }

    const parsedResult = CheckSheetSchema.safeParse(rowData)

    if (!parsedResult.success) {
        return {
            ok: false,
            message: "入力内容に誤りがあります。",
        }
    }

    const parsedData = parsedResult.data

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
        .from("records")
        .insert({
            user_id: user?.id,
            material_id: materialId,
            date: parsedData.date,
            task_count: parsedData.task_count,
            study_time: parsedData.study_time,
            study_content: parsedData.study_content,
        })

    if (error) {
        return {
            ok: false,
            message: "保存に失敗しました",
        }
    }

    revalidatePath("/dashboard")

    return {
        ok: true,
        message: "保存しました！",
    }
}

export async function updateRecord(recordId: number, formData: FormData) {
    const rowData = {
        date: new Date(String(formData.get("date") ?? "")),
        task_count: Number(formData.get("task_count") ?? 0),
        study_time: Number(formData.get("study_time") ?? 0),
        study_content: String(formData.get("study_content") ?? ""),
    }

    const parsedResult = CheckSheetSchema.safeParse(rowData)

    if (!parsedResult.success) {
        return {
            ok: false,
            message: "入力内容に誤りがあります。",
        }
    }

    const parsedData = parsedResult.data

    const supabase = await createClient()

    const { error } = await supabase
        .from("records")
        .update({
            date: parsedData.date,
            task_count: parsedData.task_count,
            study_time: parsedData.study_time,
            study_content: parsedData.study_content,
        })
        .eq("id", recordId)

    if (error) {
        return {
            ok: false,
            message: "更新に失敗しました",
        }
    }

    revalidatePath("/dashboard")

    return {
        ok: true,
        message: "更新しました！",
    }
}