"use client"

import * as React from "react"
import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { eachDayOfInterval } from "date-fns"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { MaterialTaskMap } from "@/app/(private)/dashboard/page-body"
import { Material } from "@/lib/type/material_type"
import { taskDistribute } from "@/lib/task-distribute"
import { createMaterialTaskMap } from "../calender-and-daily-task/_lib/create-material-task-map"
import { iso } from "@/lib/date/date"
import { RecordTask } from "@/app/(private)/dashboard/_lib/queries"
import { materialRecordObjectRow } from "@/app/(private)/dashboard/_lib/material-record-object-row"

const chartConfig = {
  plan: {
    label: "計画",
    color: "var(--chart-1)",
  },
  actual: {
    label: "実績",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type Props = {
  materialRow: Material[]
  recordRow: RecordTask[]
  selectedMaterialId: string
  setSelectedMaterialId: (s: string) => void
}

type ChartRow = {
  date: string
  plan: number
  actual: number | null
}

export function CompareProgressLineChart({
  materialRow,
  recordRow,
  selectedMaterialId,
  setSelectedMaterialId
}: Props) {

  const materialTaskMapRow: MaterialTaskMap[] = materialRow.map((material) => {
    const dateTaskRow = taskDistribute({
      startDate: new Date(material.start_date),
      endDate: new Date(material.end_date),
      unitCount: material.unit_count,
      rounds: material.rounds,
      taskRatioRow: material.task_ratio_row,
    })

    return createMaterialTaskMap(material, dateTaskRow)
  })

  const materialRecordRow = materialRecordObjectRow(materialRow, recordRow)

  const selectedMaterialTaskMap = materialTaskMapRow.find(
    (row) => String(row.material.id) === selectedMaterialId
  )

  const selectedMaterialRecord = materialRecordRow.find(
    (row) => String(row.material.id) === selectedMaterialId
  )

  const chartData: ChartRow[] = React.useMemo(() => {
    if (!selectedMaterialTaskMap || !selectedMaterialRecord) return []

    const material = selectedMaterialTaskMap.material

    const dateRow = eachDayOfInterval({
      start: new Date(material.start_date),
      end: new Date(material.end_date),
    })

    const recordKeys = Object.keys(selectedMaterialRecord.record)
      .filter((key) => (selectedMaterialRecord.record[key]?.taskCount ?? 0) > 0)
      .sort()

    const lastRecordKey =
      recordKeys.length > 0 ? recordKeys[recordKeys.length - 1] : null

    let planSum = 0
    let actualSum = 0

    return dateRow.map((date) => {
      const key = iso(date)

      planSum += selectedMaterialTaskMap.taskMap[key] ?? 0

      if (lastRecordKey !== null && key <= lastRecordKey) {
        console.log(`もと${selectedMaterialRecord}`)
        actualSum += selectedMaterialRecord.record[key]?.taskCount ?? 0
      }

      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        plan: planSum,
        actual:
          lastRecordKey !== null && key <= lastRecordKey ? actualSum : null,
      }
    })

  }, [selectedMaterialTaskMap, selectedMaterialRecord])

  const stats = React.useMemo(() => {
    if (!selectedMaterialTaskMap || !selectedMaterialRecord || chartData.length === 0) {
      return {
        totalPlan: 0,
        totalActual: 0,
        progressRate: 0,
        remainingTask: 0,
        totalDays: 0,
        recordedDays: 0,
        avgActualPerRecordedDay: 0,
      }
    }

    const totalPlan = chartData[chartData.length - 1]?.plan ?? 0

    const actualValues = chartData
      .map((row) => row.actual)
      .filter((value): value is number => value !== null)

    console.log(chartData)

    const totalActual =
      actualValues.length > 0 ? actualValues[actualValues.length - 1] : 0

    const progressRate =
      totalPlan > 0 ? Math.min(100, Math.floor((totalActual / totalPlan) * 100)) : 0

    const remainingTask = Math.max(0, totalPlan - totalActual)

    const totalDays = chartData.length

    const recordedDays = Object.keys(selectedMaterialRecord.record).filter(
      (key) => (selectedMaterialRecord.record[key]?.taskCount ?? 0) > 0
    ).length

    const avgActualPerRecordedDay =
      recordedDays > 0 ? Math.round((totalActual / recordedDays) * 10) / 10 : 0

    return {
      totalPlan,
      totalActual,
      progressRate,
      remainingTask,
      totalDays,
      recordedDays,
      avgActualPerRecordedDay,
    }
  }, [chartData, selectedMaterialTaskMap, selectedMaterialRecord])

  return (
    <Card className="min-h-0 h-[calc(100vh/2)] lg:h-full border-none px-0 py-2 shadow-none gap-0 mx-0 flex flex-col">
      <CardHeader className="w-full p-0">
        <div className="flex w-full flex-col text-center gap-2 lg:px-2">
          <div className="flex justify-between w-full ">
            <CardTitle className="text-base font-semibold tracking-tight text-black/85">
              進捗状況
            </CardTitle>

            <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
              {selectedMaterialId === "" ? null:

                <SelectTrigger
                  className="h-auto border p-1 rounded-2xl max-w-40 lg:max-w-80 min-w-0 truncate gap-1 bg-transparent text-xs text-center shadow-none ring-0 outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <SelectValue className="truncate" />
                </SelectTrigger>

              }

              <SelectContent>
                {materialRow.map((material) => (
                  <SelectItem key={material.id} value={String(material.id)}>
                    {material.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 pt-1 min-w-0">
            <div className="rounded-xl bg-linear-to-b from-black to-black/50 text-white lg:px-3 lg:py-2">
              <div className="text-sm lg:text-[10px]">タスク</div>
              <div className="text-sm font-semibold">{stats.totalPlan}</div>
            </div>
            <div className="rounded-xl bg-linear-to-b from-black to-black/50 text-white lg:px-3 lg:py-2">
              <div className="text-sm lg:text-[10px]">進捗</div>
              <div className="text-sm font-semibold">{stats.totalActual}</div>
            </div>
            <div className="rounded-xl bg-linear-to-b from-black to-black/50 text-white lg:px-3 lg:py-2">
              <div className="text-sm lg:text-[10px]">進捗率</div>
              <div className="text-sm font-semibold">{stats.progressRate}%</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2 min-h-0 flex-1">
        {stats.totalPlan === 0 && stats.totalActual === 0 ?
          <div className="size-full flex items-start justify-center">
            データがありません
          </div>
          :
          <ChartContainer
            config={chartConfig}
            className="w-full h-full p-2"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 6,
                right: 18,
                left: -12,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="planFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9D9D9" stopOpacity={0.28} />
                  <stop offset="65%" stopColor="#D9D9D9" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#D9D9D9" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#E9E9E9"
                strokeOpacity={0.9}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={0}
                width={50}
              />

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Area
                type="monotone"
                dataKey="plan"
                stroke="none"
                fill="url(#planFill)"
              />

              <Line
                dataKey="plan"
                type="monotone"
                stroke="#C8C8C8"
                strokeWidth={4}
                strokeDasharray="14 10"
                dot={false}
              />

              <Line
                dataKey="actual"
                type="monotone"
                stroke="#121212"
                strokeWidth={4}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        }

      </CardContent>
    </Card>
  )
}