"use client"

import { DragAndDropField } from './drag-and-drop-field'
import { Project } from '@/lib/type/project_type'
import { projectAndMaterialRow } from './data'
import { Material } from '@/lib/type/material_type'
import { saveOverviewOrderAction } from './action'
import ProjectAddButton from '@/components/button/project-add-button'
import ProjectEditButton from '@/components/button/project-edit-button'
import { getThemeColor } from '@/lib/constant/bg-color'

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

  const theme = getThemeColor("stone")

  return (
    <div className={`flex-1 p-2 min-h-0 min-w-0 space-y-3 flex flex-col ${theme.panel} rounded-2xl`}>
      <div className='flex gap-3'>
        <ProjectAddButton />
        <ProjectEditButton projectsRow={projectRow} />
      </div>
      {projectMaterialRow.length === 0 ?

        <div>
          プロジェクトを作成してください。
        </div>

        :
        <div className='flex-1'>
          <DragAndDropField
            userId={userId}
            projectMaterialRow={projectMaterialRow}
            onSaveOrder={handleSaveOrder}
          />
        </div>
      }

    </div>
  )
}