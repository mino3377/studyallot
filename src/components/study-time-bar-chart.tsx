// C:\Users\chiso\nextjs\study-allot\src\components\study-time-bar-chart.tsx
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// このチャートは「日別の合計学習時間（分）」のみを描画します。
// 値は当面ダミーで毎日 300 分（= 5h）を入れます。

type DayDatum = { date: string; total: number }

type Props = {
  /** プロジェクト開始日の ISO 文字列 (YYYY-MM-DD など) */
  startDateISO?: string | null
  /** プロジェクト終了日の ISO 文字列 (YYYY-MM-DD など) */
  endDateISO?: string | null
}

export const description = "Daily total study time (minutes)"

// カラー設定（既存の chart UI コンポーネントの変数に合わせる）
const chartConfig = {
  total: {
    label: "合計（分）",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// ========== ユーティリティ ==========
function enumerateDatesInclusive(startISO?: string | null, endISO?: string | null): string[] {
  if (!startISO || !endISO) return []
  const start = new Date(startISO)
  const end = new Date(endISO)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return []

  const res: string[] = []
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
  while (cur.getTime() <= last.getTime()) {
    // YYYY-MM-DD に整形（UTCベース）
    const y = cur.getUTCFullYear()
    const m = String(cur.getUTCMonth() + 1).padStart(2, "0")
    const d = String(cur.getUTCDate()).padStart(2, "0")
    res.push(`${y}-${m}-${d}`)
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return res
}

function minToHourLabel(min: number) {
  const h = min / 60
  return `${h.toFixed(1)}h/日`
}

// ========== 本体コンポーネント ==========
export function ChartBarInteractive({ startDateISO, endDateISO }: Props) {
  // プロジェクト期間に沿って日付配列を作る
  const dateList = React.useMemo(
    () => enumerateDatesInclusive(startDateISO ?? undefined, endDateISO ?? undefined),
    [startDateISO, endDateISO]
  )

  // 毎日 300 分（= 5h）をセット（データ未集計の暫定仕様）
  const data: DayDatum[] = React.useMemo(() => {
    return dateList.map((date) => ({ date, total: 300 }))
  }, [dateList])

  // 平均・最高（h/日）を算出
  const stats = React.useMemo(() => {
    if (data.length === 0) {
      return { avgLabel: "0.0h/日", maxLabel: "0.0h/日（-）" }
    }
    const values = data.map((d) => d.total)
    const avgMin = values.reduce((a, b) => a + b, 0) / values.length
    let max = -Infinity
    let maxDate = ""
    for (const d of data) {
      if (d.total > max) {
        max = d.total
        maxDate = d.date
      }
    }
    const maxDateLabel = maxDate
      ? new Date(maxDate).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
      : "-"
    return {
      avgLabel: minToHourLabel(avgMin),
      maxLabel: `${minToHourLabel(max === -Infinity ? 0 : max)}（${maxDateLabel}）`,
    }
  }, [data])

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>日別学習時間</CardTitle>
          <CardDescription>
            プロジェクト期間の各日について、合計学習時間（ダミー：5h/日）を表示
          </CardDescription>
        </div>

        {/* 右側：平均 / 最高（h/日） */}
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">平均</span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              {stats.avgLabel}
            </span>
            <span className="text-xs text-muted-foreground">最高 {stats.maxLabel}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[210px] w-full" /* 高さを約1〜2割低く */
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
            barCategoryGap="18%"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(String(value))
                return date.toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey={chartConfig.total.label}
                  labelFormatter={(value: unknown) => {
                    return new Date(String(value)).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey="total" fill={`var(--color-total)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
