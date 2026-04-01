//C:\Users\chiso\nextjs\study-allot\src\components\stats-card\simple-stats-panel.tsx

import React from 'react'
import SimpleStatsCard from './simple-stats-card'
import { calcTaskSumInRange, convertToDateTaskSum, dayTaskRecord, taskDistribute } from '@/lib/task-distribute'
import { Material } from '@/lib/type/material_type'
import { RecordTask } from '@/app/(private)/dashboard/_lib/queries'
import { calcRecordSumInRange, recordTaskMap } from '@/app/(private)/dashboard/_lib/material-record-object-row'

type Props = {
    materialRow: Material[]
    recordRow: RecordTask[]
    materialRecordRow: { material: Material, record: recordTaskMap }[]
}

export default function SimpleStatsPanel({
    materialRow,
    materialRecordRow
}: Props) {

    //タスクについてほしい期間を求める（ここでは一週間）
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()))


    //すべての教材の[{何月何日:何タスク}...]を統合した長い配列
    const allMaterialTaskRow: dayTaskRecord[] = []

    materialRow.forEach((material) => {
        const dayTaskRow = taskDistribute({
            startDate: new Date(material.start_date),
            endDate: new Date(material.end_date),
            unitCount: material.unit_count,
            rounds: material.rounds,
            taskRatioRow: material.task_ratio_row
        })
        allMaterialTaskRow.push(...dayTaskRow)
    })

    //教材を横断して何月何日に何タスクか、の配列
    const taskSumRow = convertToDateTaskSum(allMaterialTaskRow)

    //特定の期間に限定
    const taskSum = calcTaskSumInRange(startDate, endDate, taskSumRow)

    //特定の期間の間に何タスクやったのか(records)
    const result = calcRecordSumInRange(startDate, endDate, materialRecordRow)

    return (
        <>
            <div className="">
                <SimpleStatsCard title="進捗率" stats={Math.min(100, Math.floor((result.recordTaskSum / taskSum) * 100) ?? 0)} unit="%" />
            </div >

            <div className="border-l-2">
                <SimpleStatsCard title="タスク" stats={result.recordTaskSum} unit={`/${taskSum ?? 0}`} />
            </div>
            <div className="border-l-2">
                <SimpleStatsCard title="学習時間" stats={Math.floor((result.recordStudyTimeSum / 60) * 10)/10} unit="h" />
            </div>
        </>
    )
}
