"use client"

import { DragAndDropField } from './drag-and-drop-field'
import { Project } from '@/lib/type/project_type'
import { projectAndMaterialRow } from './data'
import { Material } from '@/lib/type/material_type'
import { saveOverviewOrderAction } from './action'

type Props = {
  userId: string
  projectRow: Project[]
  materialRow: Material[]
}

export default function PageBody({ userId, projectRow, materialRow }: Props) {
  const projectMaterialRow = projectAndMaterialRow(projectRow, materialRow)

  async function handleSaveOrder(payload: {
    projectOrderRow: {
      projectId: string | number
      order: number
    }[]
    materialOrderRow: {
      materialId: string | number
      projectId: string | number
      order: number
    }[]
  }) {
    const result = await saveOverviewOrderAction(userId, payload)

    if (!result.ok) {
      throw new Error(result.message)
    }
  }

  return (
    <div className='flex-1 p-2 min-h-0 min-w-0'>
      <DragAndDropField
        userId={userId}
        projectMaterialRow={projectMaterialRow}
        onSaveOrder={handleSaveOrder}
      />
    </div>
  )
}