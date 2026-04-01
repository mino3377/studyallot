import { dayTaskRecord } from "@/lib/task-distribute";
import { Material } from "@/lib/type/material_type";
import { iso } from "@/lib/date/date";
import { MaterialTaskMap } from "@/app/(private)/dashboard/page-body";

export function createMaterialTaskMap(material: Material, dateTaskRow: dayTaskRecord[]) {

    let taskMapValue: Record<string, number> = {}
    dateTaskRow.forEach((task) => taskMapValue[iso(task.date)] = task.taskCount)
    const materialTaskMap: MaterialTaskMap = { material: material, taskMap: taskMapValue }

    return materialTaskMap
}