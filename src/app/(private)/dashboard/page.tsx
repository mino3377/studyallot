// src/app/(private)/dashboard/page.tsx

import { createClient } from "@/utils/supabase/server"
import { ProjectPageBody } from "./page-body"
import { fetchMaterials } from "@/lib/queries"
import { redirect } from "next/navigation"
import { Material } from "@/lib/type/material_type"
import { fetchProjectIdsAndOrders, fetchRecordRows } from "./_lib/queries"
import { Project } from "@/lib/type/project_type"

export const metadata = { title: "Project | studyallot" }

export default async function ProjectPage() {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")


  //教材
  const materialRow: Material[] = await fetchMaterials(user.id)
  const projectOrderRow: Project[] = await fetchProjectIdsAndOrders(user.id)

  const adjustedMaterialRow: Material[] = []

  for (let i = 0; i < projectOrderRow.length; i++) {
    const row: Material[] = materialRow
      .filter((material) => projectOrderRow[i].id === material.project_id)
      .sort((a, b) => a.order - b.order)
    adjustedMaterialRow.push(...row)
  }

  //記録
  const recordRow = await fetchRecordRows(user.id)

  return (
    <div className="h-full w-full min-h-0 flex flex-col">
      <ProjectPageBody userId={user.id} materialRow={adjustedMaterialRow} recordRow={recordRow} />
    </div>
  )
}