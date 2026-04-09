import { Material } from "@/lib/type/material_type"

export function getCurrentMaterials(materialRow: Material[]) {

    if (!materialRow || materialRow.length === 0) return [] as Material[]

    const today = new Date()

    const adjustedMaterialRow = materialRow.filter((material) => {

        const start = new Date(material.start_date)
        const startYear = start.getFullYear();
        const startMonth = start.getMonth();
        const startDate = start.getDate();

        const s = new Date(startYear,startMonth,startDate,0,0,0)

        const end = new Date(material.end_date)
        const endYear = end.getFullYear();
        const endMonth = end.getMonth();
        const endDate = end.getDate();

        const e = new Date(endYear,endMonth,endDate,0,0,0)

        return s.getTime() < today.getTime() && today.getTime() < e.getTime()
    }
    )

    return adjustedMaterialRow as Material[]
}