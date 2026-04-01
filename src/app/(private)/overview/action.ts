"use server"

import { createClient } from "@/utils/supabase/server"

type SaveOverviewOrderPayload = {
  projectOrderRow: {
    projectId: string | number
    order: number
  }[]
  materialOrderRow: {
    materialId: string | number
    projectId: string | number
    order: number
  }[]
}

export async function saveOverviewOrderAction(
  userId: string,
  payload: SaveOverviewOrderPayload
) {
  const supabase = await createClient()

  const projectResults = await Promise.all(
    payload.projectOrderRow.map(({ projectId, order }) =>
      supabase
        .from("projects")
        .update({ order })
        .eq("id", projectId)
        .eq("user_id", userId)
    )
  )

  const projectError = projectResults.find((result) => result.error)
  if (projectError?.error) {
    return {
      ok: false,
      message: "プロジェクト順の保存に失敗しました",
    }
  }

  const materialResults = await Promise.all(
    payload.materialOrderRow.map(({ materialId, projectId, order }) =>
      supabase
        .from("materials")
        .update({
          project_id: projectId,
          order,
        })
        .eq("id", materialId)
        .eq("user_id", userId)
    )
  )

  const materialError = materialResults.find((result) => result.error)
  if (materialError?.error) {
    return {
      ok: false,
      message: "教材順の保存に失敗しました",
    }
  }

  return {
    ok: true,
    message: "",
  }
}