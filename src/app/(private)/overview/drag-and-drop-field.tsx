"use client"

import React, { useRef } from 'react'
import { adjustedMaterialRow } from './type/material-type'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import Column from './column'
import Item from './Item'
import { ProjectIdString } from '@/lib/type/project_type'
import { projectMaterialObj } from './data'
import Link from 'next/link'
import { CirclePlus } from 'lucide-react'

type SavePayload = {
  projectOrderRow: {
    projectId: string
    order: number
  }[]
  materialOrderRow: {
    materialId: string
    projectId: string
    order: number
  }[]
}

type Props = {
  userId:string
  projectMaterialRow: projectMaterialObj[]
  onSaveOrder: (payload: SavePayload) => Promise<void> | void
}

export function DragAndDropField({ userId,projectMaterialRow, onSaveOrder }: Props) {
  const itemsObj = projectMaterialRow.map((obj) => [obj.project.id, obj.materials])

  const [items, setItems] = React.useState<Record<string, adjustedMaterialRow[]>>(
    () => Object.fromEntries(itemsObj)
  )

  const [columnOrder, setColumnOrder] = React.useState<ProjectIdString[]>(
    () => projectMaterialRow.map((obj) => obj.project)
  )

  const previousItems = useRef(items)

  function buildPayload(
    nextItems: Record<string, adjustedMaterialRow[]>,
    nextColumnOrder: ProjectIdString[]
  ): SavePayload {
    return {
      projectOrderRow: nextColumnOrder.map((project, index) => ({
        projectId: project.id,
        order: index,
      })),
      materialOrderRow: nextColumnOrder.flatMap((project) =>
        (nextItems[project.id] ?? []).map((material, index) => ({
          materialId: material.id,
          projectId: project.id,
          order: index,
        }))
      ),
    }
  }

  return (
    <DragDropProvider
      onDragStart={() => {
        previousItems.current = items
      }}
      onDragOver={(event) => {
        const { source } = event.operation

        if (source?.type === 'column') return

        setItems((items) => move(items, event))
      }}
      onDragEnd={ (event) => {
        const { source } = event.operation

        if (event.canceled) {
          if (source?.type === 'item') {
            setItems(previousItems.current)
          }
          return
        }

        if (source?.type === 'column') {
          const nextColumnOrder = move(columnOrder, event)
          setColumnOrder(nextColumnOrder)

          const payload = buildPayload(items, nextColumnOrder)
          void onSaveOrder(payload)
          return
        }

        const nextItems = move(items, event)
        const payload = buildPayload(nextItems, columnOrder)
        void onSaveOrder(payload)
      }}
    >
      <div className='h-full min-w-0 min-h-0 flex p-2 gap-3 overflow-x-auto'>
        {columnOrder.map((column, index1) => (
          <Column
            id={column.id}
            key={column.id}
            column={column.id}
            index={index1}
            title={column.title}
          >
            {(items[column.id] ?? []).map((material, index2) => (
              <Item
              userId={userId}
                key={material.id}
                id={material.id}
                index={index2}
                column={column.id}
                title={material.title}
                slug={material.slug}
              />
            ))}
            <button className="w-full">
                <Link href={"/material-editor"} className="text-muted-foreground flex gap-3 items-center justify-center">
                    <CirclePlus className="size-5" />
                    <span>教材を追加</span>
                </Link>
            </button>
          </Column>
        ))}
      </div>
    </DragDropProvider>
  )
}