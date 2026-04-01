//C:\Users\chiso\nextjs\study-allot\src\components\graph\study-time-bar-chart.tsx

"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ChartContainer,
    type ChartConfig,
} from "@/components/ui/chart"
import { Material } from "@/lib/type/material_type"
import { RecordTask } from "@/app/(private)/dashboard/_lib/queries"
import {
    createDailyRecordSummaryMap,
    pickRecentDailyRecordSummary,
} from "@/app/(private)/dashboard/_lib/material-record-object-row"

type PeriodType = "7" | "14" | "30"

const chartConfig = {
    studyTime: {
        label: "学習時間",
        color: "#CFCFC9",
    },
} satisfies ChartConfig

type Props = {
    materialRow: Material[]
    recordRow: RecordTask[]
}

export function StudyTimeBarChart({ materialRow, recordRow }: Props) {
    const [period, setPeriod] = React.useState<PeriodType>("7")

    const chartData = React.useMemo(() => {
        const dailyRecordMap = createDailyRecordSummaryMap(materialRow, recordRow)
        return pickRecentDailyRecordSummary(dailyRecordMap, Number(period))
    }, [materialRow, recordRow, period])

    return (
        <div className="flex w-full min-w-0 overflow-hidden flex-col gap-3 bg-transparent lg:h-full">
            <div className="flex w-full min-w-0 items-center justify-between">
                <div className="flex min-w-0 flex-col">
                    <h3 className="text-sm font-semibold text-white/90">学習時間推移</h3>
                </div>

                <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                    <SelectTrigger className="h-8 w-fit min-w-0 border-none bg-transparent px-2 text-center text-xs text-white/70 shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">7日間</SelectItem>
                        <SelectItem value="14">14日間</SelectItem>
                        <SelectItem value="30">30日間</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <ChartContainer
                config={chartConfig}
                className="h-30 w-full min-w-0 overflow-hidden lg:min-h-0 lg:flex-1 lg:h-auto"
            >
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 0,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={0}
                        style={{ fill: "#FFFFFF" }}
                    />
                    <Bar
                        dataKey="studyTime"
                        fill="#CFCFC9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={28}
                    >
                        <LabelList
                            dataKey="studyTime"
                            position="top"
                            offset={4}
                            style={{ fill: "#FFFFFF", fontSize: 12 }}
                            formatter={(value: number) =>
                                Number(value) === 0 ? "" : `${(Number(value) / 60).toFixed(1)}`
                            }
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    )
}