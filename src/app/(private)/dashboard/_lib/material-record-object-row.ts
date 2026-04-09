//C:\Users\chiso\nextjs\study-allot\src\app\(private)\dashboard\_lib\material-record-object-row.ts

import { Material } from "@/lib/type/material_type";
import { RecordTask } from "./queries";
import { iso } from "@/lib/date/date";

export type recordTaskMap = Record<string, { taskCount: number, studyTime: number }>


// {material:{} , record:{何月何日:{ taskCount: 何個, studyTime: 何分} ...} }
export function materialRecordObjectRow(materialRow: Material[], recordRow: RecordTask[]) {

    const materialRecordRow: { material: Material, record: recordTaskMap }[] = []

    for (let i = 0; i < materialRow.length; i++) {

        const recordTaskMap: recordTaskMap = {}

        recordRow
            .filter((record) => materialRow[i].id === record.material_id)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .forEach((record) => {
                return (
                    recordTaskMap[iso(record.date)] = {
                        taskCount: record.task_count,
                        studyTime: record.study_time
                    }
                )
            })

        materialRecordRow.push({
            material: materialRow[i],
            record: recordTaskMap
        })
    }

    return materialRecordRow
}

//ある日までにその教材がどのくらいタスクを完了しているのか
export function calcDoneTaskCount(records: recordTaskMap) {

    // const today = new Date()

    const doneTaskCount = Object
        .entries(records)
        .reduce((sum, record) => sum += record[1].taskCount, 0)
    // .filter((record) => new Date(record[0]).getTime() <= today.getTime())
    return doneTaskCount
}

// 記録の特定の期間内でのやったタスク数と学習時間のオブジェクト　{タスク合計:~,学習時間合計:~}
export function calcRecordSumInRange(
    startDate: Date,
    endDate: Date,
    materialRecordRow: { material: Material, record: recordTaskMap }[]) {

    const recordRowFlatted: { taskCount: number, studyTime: number }[] = []

    materialRecordRow.forEach((record) => {
        Object
            .entries(record.record)
            .filter((row) => startDate.getTime() <= new Date(row[0]).getTime() && new Date(row[0]).getTime() <= endDate.getTime())
            .forEach((row) => recordRowFlatted.push(row[1]))
    })

    const recordTaskSum = recordRowFlatted.reduce((sum, record) => sum += record.taskCount, 0)
    const recordStudyTimeSum = recordRowFlatted.reduce((sum, record) => sum += record.studyTime, 0)

    return { recordTaskSum: recordTaskSum, recordStudyTimeSum: recordStudyTimeSum }
}

// 教材横断で日付ごとの記録をまとめる関数
// { "2026-03-30": { taskCount: ~, studyTime: ~ }, ... }
export function createDailyRecordSummaryMap(
    materialRow: Material[],
    recordRow: RecordTask[]
) {
    const materialIdSet = new Set(materialRow.map((material) => material.id))
    const dailyRecordMap: recordTaskMap = {}

    recordRow
        .filter((record) => materialIdSet.has(record.material_id))
        .forEach((record) => {
            const key = iso(record.date)

            if (!dailyRecordMap[key]) {
                dailyRecordMap[key] = { taskCount: 0, studyTime: 0 }
            }

            dailyRecordMap[key].taskCount += record.task_count
            dailyRecordMap[key].studyTime += record.study_time
        })

    return dailyRecordMap
}


// 今日から指定日数分の記録だけをチャート用配列にする関数
// [{ day:"3/24", taskCount:~, studyTime:~ }, ... ]
export function pickRecentDailyRecordSummary(
    dailyRecordMap: recordTaskMap,
    days: number
) {
    const today = new Date()
    const chartRow: { day: string, taskCount: number, studyTime: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setHours(0, 0, 0, 0)
        date.setDate(today.getDate() - i)

        const key = iso(date)
        const record = dailyRecordMap[key]

        chartRow.push({
            day: `${date.getMonth() + 1}/${date.getDate()}`,
            taskCount: record?.taskCount ?? 0,
            studyTime: record?.studyTime ?? 0,
        })
    }

    return chartRow
}