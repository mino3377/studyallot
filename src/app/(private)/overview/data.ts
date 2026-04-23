import { Material } from "@/lib/type/material_type"
import { Project } from "@/lib/type/project_type"

export type GanttBarMaterial = Material & {
    projectTitle: string
    projectSlug: string
    startIndex: number
    endIndex: number
}

function parseDate(date: string) {
    return new Date(date)
}

function getMonthStart(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}`
}

//ガントチャートの全体の範囲
export function makeRange(from: Date, to: Date) {
    const fromYear = from.getFullYear()
    const fromMonth = from.getMonth()

    const toYear = to.getFullYear()
    const toMonth = to.getMonth()

    const rangeArr: Date[] = []

    for (let y = fromYear; y <= toYear; y++) {
        if (y === fromYear) {
            for (let m = fromMonth; m <= 11; m++) {
                rangeArr.push(new Date(y, m))
            }
        } else if (y === toYear) {
            for (let m = 0; m <= toMonth; m++) {
                rangeArr.push(new Date(y, m))
            }
        } else {
            for (let m = 0; m <= 11; m++) {
                rangeArr.push(new Date(y, m))
            }
        }
    }

    //12か月以下の場合は補う
    if (rangeArr.length < 13) {
        const n = rangeArr.length
        const last = rangeArr[n - 1]
        const lastYear = last.getFullYear()
        const lastMonth = last.getMonth()

        const rest = 13 - n

        for (let m = lastMonth + 1; m <= lastMonth + rest; m++) {
            rangeArr.push(new Date(lastYear, m))
        }
    }

    return rangeArr
}

export function sortProjectRow(projectRow: Project[]) {
    return [...projectRow].sort((a, b) => {
        const aOrder = a.order ?? Number.MAX_SAFE_INTEGER
        const bOrder = b.order ?? Number.MAX_SAFE_INTEGER
        return aOrder - bOrder
    })
}

export function sortMaterialRow(materialRow: Material[], projectRow: Project[]) {
    const sortedProjects = sortProjectRow(projectRow)
    const projectOrderMap = new Map<number, number>()

    sortedProjects.forEach((project, index) => {
        projectOrderMap.set(project.id, project.order ?? index)
    })

    return [...materialRow].sort((a, b) => {
        const aProjectOrder = projectOrderMap.get(a.project_id) ?? Number.MAX_SAFE_INTEGER
        const bProjectOrder = projectOrderMap.get(b.project_id) ?? Number.MAX_SAFE_INTEGER

        if (aProjectOrder !== bProjectOrder) return aProjectOrder - bProjectOrder
        return a.order - b.order
    })
}

export function getSelectedProjectSlug(
    searchParams: URLSearchParams,
    projectRow: Project[]
): string | "all" {
    const raw = searchParams.get("project")
    if (!raw || raw === "all") return "all"

    const exists = projectRow.some((project) => project.slug === raw)
    return exists ? raw : "all"
}

export function filterMaterialRowByProjectSlug(
    materialRow: Material[],
    projectRow: Project[],
    selectedProjectSlug: string | "all"
) {
    if (selectedProjectSlug === "all") return materialRow

    const targetProject = projectRow.find((project) => project.slug === selectedProjectSlug)
    if (!targetProject) return materialRow

    return materialRow.filter((material) => material.project_id === targetProject.id)
}

export function getRangeFromMaterials(materialRow: Material[]) {
    if (materialRow.length === 0) {
        const today = new Date()
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
            from: monthStart,
            to: monthStart,
            rangeArr: [monthStart],
        }
    }

    let minDate = getMonthStart(parseDate(materialRow[0].start_date))
    let maxDate = getMonthStart(parseDate(materialRow[0].end_date))

    for (const material of materialRow) {
        const start = getMonthStart(parseDate(material.start_date))
        const end = getMonthStart(parseDate(material.end_date))

        if (start.getTime() < minDate.getTime()) minDate = start
        if (end.getTime() > maxDate.getTime()) maxDate = end
    }

    return {
        from: minDate,
        to: maxDate,
        rangeArr: makeRange(minDate, maxDate),
    }
}

export function buildGanttBarMaterials(
    materialRow: Material[],
    projectRow: Project[],
    rangeArr: Date[]
): GanttBarMaterial[] {
    const monthIndexMap = new Map<string, number>()
    const projectMap = new Map<number, Project>()

    rangeArr.forEach((date, index) => {
        monthIndexMap.set(getMonthKey(date), index)
    })

    projectRow.forEach((project) => {
        projectMap.set(project.id, project)
    })

    return materialRow.map((material) => {
        const startDate = getMonthStart(parseDate(material.start_date))
        const endDate = getMonthStart(parseDate(material.end_date))

        const startIndex = monthIndexMap.get(getMonthKey(startDate)) ?? 0
        const endIndex =
            monthIndexMap.get(getMonthKey(endDate)) ?? Math.max(rangeArr.length - 1, 0)

        const project = projectMap.get(material.project_id)

        return {
            ...material,
            projectTitle: project?.title ?? "",
            projectSlug: project?.slug ?? "",
            startIndex,
            endIndex,
        }
    })
}