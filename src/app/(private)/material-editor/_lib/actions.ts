"use server"

import { makePublicId } from "@/lib/slug"
import { MaterialBaseSchema } from "@/lib/validators/material"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveNewMaterial(formData: FormData) {

    const rowData = {
        title: String(formData.get("materialname") ?? ""),
        project: String(formData.get("project") ?? ""),
        start_date: new Date(String(formData.get("startdate") ?? "")),
        end_date: new Date(String(formData.get("enddate") ?? "")),
        unit_type: String(formData.get("unittype") ?? ""),
        unit_count: Number(formData.get("unitcount") ?? 0),
        rounds: Number(formData.get("rounds") ?? 0),
    }

    const row_task_ratio_row = formData.get("taskratiorow")

    if (typeof row_task_ratio_row !== "string") {

        return {
            ok: false,
            message: "タスク配分を取得できませんでした。もう一度お試しください。",
        }
    }

    const task_ratio_row = JSON.parse(row_task_ratio_row)

    const parsedResult = MaterialBaseSchema.safeParse(rowData)

    if (!parsedResult.success) {
        return {
            ok: false,
            message: "入力内容に誤りがあります。",
        }
    }

    const parsedData = parsedResult.data

    const materialSlug = makePublicId("m")

    const supabase = await createClient()
    const {data: { user } } = await supabase.auth.getUser()

    const { data: lastMaterial, error: orderError } = await supabase
        .from("materials")
        .select("order")
        .eq("project_id", Number(parsedData.project))
        .order("order", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()

    if (orderError) {
        return {
            ok: false,
            message: "教材順の取得に失敗しました。"
        }
    }

    const nextOrder = lastMaterial ? lastMaterial.order + 1 : 0

    const { error } = await supabase
        .from("materials")
        .insert({
            "user_id": user?.id,
            "slug": materialSlug,
            "title": parsedData.title,
            "project_id": Number(parsedData.project),
            "start_date": parsedData.start_date,
            "end_date": parsedData.end_date,
            "unit_type": parsedData.unit_type,
            "unit_count": parsedData.unit_count,
            "rounds": parsedData.rounds,
            "task_ratio_row": task_ratio_row,
            "order": nextOrder,
        })

    if (error) {
        return {
            ok: false,
            message: "保存に失敗しました"
        }
    }

    revalidatePath("/dashboard")
    
    return {
        ok: true,
        message: "保存しました！"
    }
}

export async function updateMaterial(formData: FormData) {
    const editSlug = String(formData.get("editSlug") ?? "")

    if (!editSlug) {
        return {
            ok: false,
            message: "編集対象の教材が見つかりませんでした。"
        }
    }

    const rowData = {
        title: String(formData.get("materialname") ?? ""),
        project: String(formData.get("project") ?? ""),
        start_date: new Date(String(formData.get("startdate") ?? "")),
        end_date: new Date(String(formData.get("enddate") ?? "")),
        unit_type: String(formData.get("unittype") ?? ""),
        unit_count: Number(formData.get("unitcount") ?? 0),
        rounds: Number(formData.get("rounds") ?? 0),
    }

    const row_task_ratio_row = formData.get("taskratiorow")

    if (typeof row_task_ratio_row !== "string") {
        return {
            ok: false,
            message: "タスク配分を取得できませんでした。もう一度お試しください。",
        }
    }

    const task_ratio_row = JSON.parse(row_task_ratio_row)

    const parsedResult = MaterialBaseSchema.safeParse(rowData)

    if (!parsedResult.success) {
        return {
            ok: false,
            message: "入力内容に誤りがあります。",
        }
    }

    const parsedData = parsedResult.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from("materials")
        .update({
            "title": parsedData.title,
            "project_id": Number(parsedData.project),
            "start_date": parsedData.start_date,
            "end_date": parsedData.end_date,
            "unit_type": parsedData.unit_type,
            "unit_count": parsedData.unit_count,
            "rounds": parsedData.rounds,
            "task_ratio_row": task_ratio_row,
        })
        .eq("user_id", user?.id)
        .eq("slug", editSlug)

    if (error) {
        return {
            ok: false,
            message: "更新に失敗しました"
        }
    }

    revalidatePath("/dashboard")
    revalidatePath("/material-editor")

    return {
        ok: true,
        message: "更新しました！"
    }
}