import React from 'react'
import MonthCalender from './month-calender'
import DailyTasksPanel from './daily-tasks-panel'
import { Material } from '@/lib/type/material_type'
import { createMaterialTaskMap } from './_lib/create-material-task-map'
import { taskDistribute } from '@/lib/task-distribute'
import { MaterialTaskMap } from '@/app/(private)/dashboard/page-body'




type Props = {
    materialRow: Material[]
}

export function CalendarAndDailyTaskPanel({
materialRow
}: Props) {

    const now = new Date()
    const todayYear = now.getFullYear()
    const todayMonth = now.getMonth()
    const todayDate = now.getDate()
    const today = new Date(todayYear, todayMonth, todayDate)

    const [selectedDay, setSelectedDay] = React.useState<Date>(today)
    const [displayDate, setDisplayDate] = React.useState<Date>(today)

    // 教材ごとのタスク
    const materialTaskMapRow: MaterialTaskMap[] = []

    materialRow.map((material) => {

        const dateTaskRow = taskDistribute({
            startDate: new Date(material.start_date),
            endDate: new Date(material.end_date),
            unitCount: material.unit_count,
            rounds: material.rounds,
            taskRatioRow: material.task_ratio_row
        })

        const materialTaskMap = createMaterialTaskMap(material, dateTaskRow)
        materialTaskMapRow.push(materialTaskMap)
    })

    

    return (
        <>
            <div className="rounded-md h-[calc(100vh/2)]  bg-white p-3 w-full lg:flex lg:items-start lg:justify-center min-h-0">
                <MonthCalender selectedDay={selectedDay} displayDate={displayDate} setSelectedDay={(day) => setSelectedDay(day)} setDisplayDate={(date) => setDisplayDate(date)} />
            </div>
            <div className="rounded-md h-[calc(100vh/3)] overflow-y-auto mb-20 lg:mb-0 bg-linear-to-b from-black to-black/30 text-white w-full lg:flex-1 min-h-0 lg:justify-center">
                <DailyTasksPanel selectedDay={selectedDay} materialTaskMapRow={materialTaskMapRow} />
            </div>
        </>
    )
}
