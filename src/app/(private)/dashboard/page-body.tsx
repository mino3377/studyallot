//C:\Users\chiso\nextjs\study-allot\src\app\(private)\project\page-body.tsx

"use client"

import MaterialsList from "./_components/materials-list"

import type { Material } from "@/lib/type/material_type"
import { getCurrentMaterials } from "./_lib/get-current-materials"
import SimpleStatsPanel from "@/components/stats-card/simple-stats-panel"
import type { RecordTask } from "./_lib/queries"
import { CalendarAndDailyTaskPanel } from "@/components/calender-and-daily-task/calender-and-daily-task-panel"
import { materialRecordObjectRow } from "./_lib/material-record-object-row"
import { weekLabelJP } from "@/lib/constant/period-label"
import { CompareProgressLineChart } from "../../../components/graph/compare-progress-line-chart"
import Hero from "./_components/hero"

export type MaterialTaskMap = {
  material: Material,
  taskMap: Record<string, number>
}

type Props = {
  userId: string,
  materialRow: Material[],
  recordRow: RecordTask[]
}

export function ProjectPageBody({ userId, materialRow, recordRow }: Props) {
  const today = new Date()
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
  const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()))

  const thisWeekRange = `${weekStart.getMonth() + 1}/${weekStart.getDate()}(${weekLabelJP[weekStart.getDay()]}) ~ ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}(${weekLabelJP[weekEnd.getDay()]})`

  const materialRowForList = getCurrentMaterials(materialRow)
  const materialRecordRow = materialRecordObjectRow(materialRowForList, recordRow)

  return (
    <div className="flex h-full min-h-0 flex-col rounded-t-2xl">
      <div className="overflow-y-auto lg:grid lg:h-full min-h-0 lg:grid-cols-7 gap-2 p-3 overflow-x-hidden">
        <div className="lg:col-span-5 lg:grid min-h-0 lg:h-full lg:grid-rows-[minmax(200px,32%)_minmax(0,1fr)] gap-2">
          {/* タイマー + メモ */}
          <Hero materialRow={materialRow} recordRow={recordRow} />
          <div className="mt-4 lg:mt-0 lg:grid lg:h-full min-h-0 gap-2 lg:grid-cols-2">

            <div className="lg:grid min-h-0 lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] gap-2 lg:mx-1">
              <div className="rounded-md bg-white p-2">
                <div className="text-xs font-medium">
                  今週の記録 {thisWeekRange}
                </div>

                <div className="grid min-h-0 w-full grid-cols-3 p-2 pb-3 font-semibold">
                  <SimpleStatsPanel
                    recordRow={recordRow}
                    materialRow={materialRowForList}
                    materialRecordRow={materialRecordRow}
                  />
                </div>
              </div>

              <div className="mt-4 lg:mt-0 min-h-0 lg:h-full">
                <MaterialsList
                  userId={userId}
                  materialRecordRow={materialRecordRow}
                />
              </div>
            </div>

            <div className="mt-4 lg:mt-0 min-h-0 lg:h-full rounded-md bg-white p-2 lg:mx-1">
              <div className="flex lg:h-full min-h-0 flex-col">
                <CompareProgressLineChart
                  materialRow={materialRowForList}
                  recordRow={recordRow}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-0 lg:col-span-2 min-h-0 lg:h-full ">
          <div className="lg:h-full min-h-0 rounded-2xl space-y-2 flex flex-col">
            <CalendarAndDailyTaskPanel materialRow={materialRow} />
          </div>
        </div>
      </div>
    </div>
  )
}