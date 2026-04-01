import { createClient } from "@/utils/supabase/server";
import { Material } from "./type/material_type";
import { Project } from "./type/project_type";

export function generateProjectIdRow(projectRow: Project[]) {
    if (projectRow.length === 0) return []
    const projectIdRow = projectRow.map((project) => project.id)
    return projectIdRow
}

