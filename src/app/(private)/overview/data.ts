import { Material } from "@/lib/type/material_type";
import { Project, ProjectIdString } from "@/lib/type/project_type";

import { adjustedMaterialRow } from "./type/material-type";

export type projectMaterialObj = {
    project: ProjectIdString,
    materials: adjustedMaterialRow[]
}

export function projectAndMaterialRow(projectRow: Project[], materialRow: Material[]) {

    const adjustedMaterialRow: adjustedMaterialRow[] = materialRow.map((material) => ({
        id: String(material.id),
        slug: material.slug,
        projectId: String(material.project_id),
        title: material.title,
    }))

    const adjustedProjectRow = projectRow.map((project) => ({
        id: String(project.id),
        slug: project.slug,
        title: project.title,
        order: project.order
    }))

    const projectMaterialRow: projectMaterialObj[] = []

    for (let i = 0; i < adjustedProjectRow.length; i++) {
        const materials = adjustedMaterialRow.filter((material) => material.projectId === adjustedProjectRow[i].id)
        projectMaterialRow.push({ project: adjustedProjectRow[i], materials: materials })
    }
    return projectMaterialRow
}