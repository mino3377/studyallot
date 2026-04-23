//C:\Users\chiso\nextjs\study-allot\src\lib\action.ts

"use server"

import { createClient } from "@/utils/supabase/server";
import { makePublicId } from "./slug";
import { redirect } from "next/navigation";
import { projectBaseSchema } from "./validators/project";
import { revalidatePath } from "next/cache";

export async function saveProject(formData: FormData) {
    const rowData = {
        title: formData.get("title")
    }

    const parsedData = projectBaseSchema.safeParse(rowData)

    if (!parsedData.success) {
        return {
            ok: false,
            message: "入力内容に誤りがありました",
        }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: orderRow, error: orderError } = await supabase
        .from("projects")
        .select("order")
        .eq("user_id", user.id)
        .order("order", { nullsFirst: false })

    if (orderError) {
        return {
            ok: false,
            message: orderError.message,
        }
    }

    const { error } = await supabase
        .from("projects")
        .insert({
            "slug": makePublicId("p"),
            "user_id": user.id,
            "order": orderRow.length,
            "title": parsedData.data.title
        })
        .eq("user_id", user.id)
        .order("order", { nullsFirst: false })

    if (error) {
        return {
            ok: false,
            message: "プロジェクトを作成できませんでした",
        }
    }

    revalidatePath("/dashboard")

    return {
        ok: true,
        message: "保存しました！",
    }
}

export async function saveEditedProjects(formData: FormData) {
    const projectsValue = formData.get("projects")

    if (typeof projectsValue !== "string") {
        return {
            ok: false,
            message: "プロジェクト情報を取得できませんでした",
        }
    }

    let projectsRow: { id: number; title: string }[]

    try {
        projectsRow = JSON.parse(projectsValue)
    } catch {
        return {
            ok: false,
            message: "プロジェクト情報の読み取りに失敗しました",
        }
    }

    if (!Array.isArray(projectsRow)) {
        return {
            ok: false,
            message: "プロジェクト情報の形式が正しくありません",
        }
    }

    for (const project of projectsRow) {
        const parsedData = projectBaseSchema.safeParse({
            title: project.title
        })

        if (!parsedData.success) {
            return {
                ok: false,
                message: parsedData.error.issues[0].message,
            }
        }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: currentProjects, error: fetchError } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)

    if (fetchError) {
        return {
            ok: false,
            message: "プロジェクトを取得できませんでした",
        }
    }

    const keepIdRow = projectsRow.map((project) => project.id)
    const deleteIdRow = (currentProjects ?? [])
        .filter((project) => !keepIdRow.includes(project.id))
        .map((project) => project.id)

    if (deleteIdRow.length > 0) {
        const { error: deleteError } = await supabase
            .from("projects")
            .delete()
            .eq("user_id", user.id)
            .in("id", deleteIdRow)

        if (deleteError) {
            return {
                ok: false,
                message: "プロジェクトを削除できませんでした",
            }
        }
    }

    for (let i = 0; i < projectsRow.length; i++) {
        const project = projectsRow[i]

        const { error: updateError } = await supabase
            .from("projects")
            .update({
                "title": project.title,
                "order": i,
            })
            .eq("user_id", user.id)
            .eq("id", project.id)

        if (updateError) {
            return {
                ok: false,
                message: "プロジェクトを更新できませんでした",
            }
        }
    }

    revalidatePath("/dashboard")

    return {
        ok: true,
        message: "保存しました！",
    }
}

export async function deleteProjectById(projectId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("user_id", user.id)
        .eq("id", projectId)

    if (error) {
        return {
            ok: false,
            message: "プロジェクトを削除できませんでした",
        }
    }

    revalidatePath("/dashboard")

    return {
        ok: true,
        message: "プロジェクトを削除しました",
    }
}

export async function deleteMaterialById(materialId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { error } = await supabase
        .from("materials")
        .delete()
        .eq("user_id", user.id)
        .eq("id", materialId)

    if (error) {
        return {
            ok: false,
            message: "教材を削除できませんでした",
        }
    }

    revalidatePath("/dashboard")

    return {
        ok: true,
        message: "教材を削除しました",
    }
}