import { eachDayOfInterval } from "date-fns"

type Props = {
    startDate: Date,
    endDate: Date,
    unitCount: number,
    rounds: number,
    taskRatioRow: number[]
}

export type dayTaskRecord = { date: Date, taskCount: number }


export function taskDistributeByDays({
    startDate,
    endDate,
    unitCount,
    rounds,
    taskRatioRow
}: Props) {

    // タスク総量
    const totalTask = unitCount * rounds

    let totalRatio = 0
    totalRatio = taskRatioRow.reduce((sum, num) => sum += num, 0)

    //曜日ごとのタスク量配列　長さ7
    const taskcountRow = taskRatioRow.map((num) => Math.floor(num / totalRatio * totalTask))

    let actualTotalTask = 0
    taskcountRow.map((num) => actualTotalTask += num)

    // 全体タスクのあまり
    const totalRestTask = totalTask - actualTotalTask

    // 曜日ごとに比率の高い配列に余りを振り直す。

    type taskRatioObject = {
        number: number, ratio: number
    }

    const taskRatioObjectRow: taskRatioObject[] = []

    for (let i = 0; i < 7; i++) {
        taskRatioObjectRow.push(
            { number: i, ratio: taskRatioRow[i] }
        )
    }

    taskRatioObjectRow.sort((a, b) => b.ratio - a.ratio)

    for (let i = 0; i < totalRestTask; i++) {
        taskcountRow[taskRatioObjectRow[i % 7].number] += 1
    }

    //開始日から終了日までのdate配列
    const totalDateRow = eachDayOfInterval({
        start: startDate,
        end: endDate
    })

    const daysTaskRow: dayTaskRecord[][] = []

    //daysTaskRow完成　[[],[],...] 日月火...の{各日の日にちとタスク数}
    for (let i = 0; i < 7; i++) {
        const dateRow = totalDateRow.filter((date) => date.getDay() === i)

        daysTaskRow[i] = []

        if (dateRow.length === 0) continue

        const taskPerDay = Math.floor(taskcountRow[i] / dateRow.length)
        const RestTask = taskcountRow[i] - taskPerDay * dateRow.length

        for (let d = 0; d < dateRow.length; d++) {
            daysTaskRow[i].push(
                { date: dateRow[d], taskCount: taskPerDay }
            )
        }
        if (RestTask > 0) {
            for (let d = 1; d <= RestTask; d++) {
                daysTaskRow[i][daysTaskRow[i].length - d].taskCount += 1
            }
        }
    }

    return daysTaskRow
}

//曜日による配列を各日による配列へ
export function taskDistribute({
    startDate,
    endDate,
    unitCount,
    rounds,
    taskRatioRow
}: Props) {

    const daysTaskRow = taskDistributeByDays({ startDate, endDate, unitCount, rounds, taskRatioRow });

    const daysTaskRowFlatted = daysTaskRow.flat()

    daysTaskRowFlatted.sort((a, b) => a.date.getTime() - b.date.getTime())

    return daysTaskRowFlatted
}

//期間が被った[{何月何日:何タスク}...]の期間を統合して、その日のタスクの合計の配列へ
export function convertToDateTaskSum(materialTaskRow: dayTaskRecord[]) {
    const sortedRow = materialTaskRow.sort((a, b) => a.date.getTime() - b.date.getTime())
    const IntervalRow = eachDayOfInterval({
        start: sortedRow[0].date,
        end: sortedRow[sortedRow.length - 1].date
    })

    const taskSumRow: dayTaskRecord[] = []

    for (let i = 0; i < IntervalRow.length; i++) {
        const sum = sortedRow
            .filter((task) => task.date.getTime() === IntervalRow[i].getTime())
            .reduce((sum, task) => sum + task.taskCount, 0)
        taskSumRow.push({
            date: IntervalRow[i],
            taskCount: sum ?? 0
        })
    }
    return taskSumRow
}

// 特定の期間の中に計画上何タスクあるのか
export function calcTaskSumInRange(start: Date, end: Date, taskSumRow: dayTaskRecord[]) {
    const IntervalRow = eachDayOfInterval({
        start: start,
        end: end
    })

    let sum: number = 0

    for (let i = 0; i < IntervalRow.length; i++) {
        const task = taskSumRow.find(
            (task) => task.date.getTime() === IntervalRow[i].getTime()
        )
        sum += task?.taskCount ?? 0
    }
    return sum
}