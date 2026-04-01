import { Material } from "@/lib/type/material_type"

export function getCurrentMaterials(materialRow: Material[]) {

    if (!materialRow || materialRow.length === 0) return [] as Material[]

    const today = new Date()

    const adjustedMaterialRow = materialRow.filter((material) => {
        const start = new Date(material.start_date)
        const end = new Date(material.end_date)
        return start.getTime() < today.getTime() && today.getTime() < end.getTime()
    }
    )

    return adjustedMaterialRow as Material[]
}