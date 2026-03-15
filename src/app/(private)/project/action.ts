//C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\action.ts

"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

//プロジェクト名と名前の変更
export async function updateProjectMetaAction(fd: FormData) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data?.user) redirect("/login")

    const projectId = Number(fd.get("projectId"))
    const projectName = String(fd.get("projectName") ?? "").trim()
    const ordersJson = String(fd.get("orders") ?? "[]")

    if (!projectId || Number.isNaN(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (projectName) {
        const { error } = await supabase
            .from("projects")
            .update({ name: projectName })
            .eq("id", projectId)
            .eq("user_id", data.user.id)

        if (error) throw new Error(error.message)
    }

    let orders: { projectId: number; order: number }[] = []
    try {
        const parsed = JSON.parse(ordersJson)
        if (Array.isArray(parsed)) orders = parsed
    } catch { }

    for (const it of orders) {
        const pid = Number(it.projectId)
        const order = Number(it.order)
        if (!pid || Number.isNaN(order)) continue

        const { error } = await supabase
            .from("projects")
            .update({ order })
            .eq("id", pid)
            .eq("user_id", data.user.id)

        if (error) throw new Error(error.message)
    }

    revalidatePath("/project")
}

//プロジェクト削除
export async function deleteProjectAction(fd: FormData) {

    const supabase = await createClient()
    const { data} = await supabase.auth.getUser()
    if (!data?.user) redirect("/login")

    const projectId = Number(fd.get("projectId"))
    if (!projectId || Number.isNaN(projectId)) {
        throw new Error("Invalid projectId")
    }

    const { error: matsErr } = await supabase
        .from("materials")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", data.user.id)

    if (matsErr) throw new Error(matsErr.message)

    const { error: projErr } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", data.user.id)

    if (projErr) throw new Error(projErr.message)

    revalidatePath("/project")
}

//教材の順番の変更
export async function updateMaterialOrdersAction(fd: FormData) {
    const supabase = await createClient()
    const { data} = await supabase.auth.getUser()
    if (!data?.user) redirect("/login")

    const projectSlug = String(fd.get("projectSlug") ?? "").trim()
    const ordersJson = String(fd.get("orders") ?? "[]")

    if (!projectSlug) throw new Error("Invalid projectSlug")

    let orders: { materialId: number; order: number }[] = []
    try {
        const parsed = JSON.parse(ordersJson)
        if (Array.isArray(parsed)) orders = parsed
    } catch { }

    const { data: proj, error: projErr } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("slug", projectSlug)
        .maybeSingle()

    if (projErr) throw new Error(projErr.message)
    if (!proj?.id) throw new Error("Project not found")

    for (const it of orders) {
        const mid = Number(it.materialId)
        const order = Number(it.order)
        if (!mid || Number.isNaN(order)) continue

        const { error } = await supabase
            .from("materials")
            .update({ order })
            .eq("id", mid)
            .eq("user_id",data.user.id)
            .eq("project_id", proj.id)

        if (error) throw new Error(error.message)
    }

    revalidatePath("/project")
}


//教材の削除
export async function deleteMaterialAction(fd: FormData) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data?.user) redirect("/login")

    const materialId = Number(fd.get("materialId"))
    if (!materialId || Number.isNaN(materialId)) {
        throw new Error("Invalid materialId")
    }

    const { error } = await supabase
        .from("materials")
        .delete()
        .eq("id", materialId)
        .eq("user_id", data.user.id)

    if (error) throw new Error(error.message)

    revalidatePath("/project")
}

//遅れている教材を再配分（計画配列の変更）
export async function replanDelayedPlansAction(fd: FormData) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data?.user) redirect("/login")

    const projectSlug = fd.get("projectSlug") ?? "".trim()
    if (!projectSlug) throw new Error("Invalid projectSlug")

    const getTodayISOJST = () => {
        const fmt = new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        return fmt.format(new Date())
    }

    const msPerDay = 24 * 60 * 60 * 1000
    const toISO10 = (s?: string | null) => (s ?? "").slice(0, 10)

    const clampInt = (n: number, min: number, max: number) => {
        if (!Number.isFinite(n)) return min
        if (n < min) return min
        if (n > max) return max
        return n
    }

    const sumPrefix = (arr: number[], endExclusive: number) => {
        let s = 0
        for (let i = 0; i < endExclusive; i++) {
            const v = arr[i]
            s += Number.isFinite(v) ? v : 0
        }
        return s
    }

    const padPrefixFromActual = (actual: number[], len: number) => {
        const out: number[] = new Array(len)
        for (let i = 0; i < len; i++) {
            const v = actual[i]
            out[i] = Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
        }
        return out
    }

    const distributeFrontLoaded = (remain: number, days: number) => {
        const out = new Array(days).fill(0)
        if (days <= 0) return out

        const base = Math.floor(remain / days)
        const extra = remain % days

        for (let i = 0; i < days; i++) out[i] = base
        for (let i = 0; i < extra; i++) out[i] += 1
        return out
    }

    const todayISO = getTodayISOJST()

    const { data: proj, error: projErr } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("slug", projectSlug)
        .maybeSingle()

    if (projErr) throw new Error(projErr.message)
    if (!proj?.id) throw new Error("Project not found")

    const { data: mats, error: matsErr } = await supabase
        .from("materials")
        .select("id, start_date, end_date, unit_count, rounds, plan_days, actual_days")
        .eq("user_id", data.user.id)
        .eq("project_id", proj.id)

    if (matsErr) throw new Error(matsErr.message)

    for (const m of mats ?? []) {
        const start_date = toISO10(m.start_date)
        const end_date = toISO10(m.end_date)
        const unit_count = Number(m.unit_count ?? 0)
        const rounds = Number(m.rounds ?? 0)

        if (!start_date || !end_date) continue
        if (!Number.isFinite(unit_count) || !Number.isFinite(rounds)) continue
        if (unit_count <= 0 || rounds <= 0) continue

        const start = new Date(`${start_date}T00:00:00`)
        const end = new Date(`${end_date}T00:00:00`)
        const today = new Date(`${todayISO}T00:00:00`)

        const D = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1
        if (!Number.isFinite(D) || D <= 0) continue

        const rawIdx = Math.floor((today.getTime() - start.getTime()) / msPerDay)
        const fixedLen = clampInt(rawIdx + 1, 0, D)

        const planDays: number[] = Array.isArray(m.plan_days) ? m.plan_days : []
        const actualDays: number[] = Array.isArray(m.actual_days) ? m.actual_days : []

        const plannedCum = sumPrefix(planDays, fixedLen)
        const actualCum = sumPrefix(actualDays, fixedLen)

        if (!(plannedCum > actualCum)) continue

        const totalTasks = Math.max(0, unit_count * rounds)

        const fixed = padPrefixFromActual(actualDays, fixedLen)
        const done = fixed.reduce((s, n) => s + n, 0)

        const remain = Math.max(0, totalTasks - done)
        const remainDays = D - fixedLen

        const future = distributeFrontLoaded(remain, remainDays)
        const nextPlan = [...fixed, ...future].slice(0, D)

        const { error: upErr } = await supabase
            .from("materials")
            .update({ plan_days: nextPlan })
            .eq("id", m.id)
            .eq("user_id", data.user.id)

        if (upErr) throw new Error(upErr.message)
    }

    revalidatePath("/project")
}

//タスクの記録
export async function saveSectionRecordsAction(fd: FormData) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data?.user) redirect("/login")

    const materialId = Number(fd.get("materialId"))
    const actualDaysJson = String(fd.get("actualDays") ?? "[]")

    if (!materialId || Number.isNaN(materialId)) {
        throw new Error("Invalid materialId")
    }

    let actualDays: number[] = []
    try {
        const parsed = JSON.parse(actualDaysJson)
        if (Array.isArray(parsed)) actualDays = parsed
    } catch { }

    const safeActualDays = (actualDays ?? []).map((n) =>
        Number.isFinite(Number(n)) ? Math.max(0, Math.floor(Number(n))) : 0
    )

    const { error } = await supabase
        .from("materials")
        .update({ actual_days: safeActualDays })
        .eq("id", materialId)
        .eq("user_id", data.user.id)

    if (error) throw new Error(error.message)

    revalidatePath("/project")
}