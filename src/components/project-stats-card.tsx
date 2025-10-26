import React from "react"
import { Card } from "./ui/card"
import { BarChart3, BookOpen, Timer, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type Props = {
  title: "教材数" | "進捗率" | "合計学習時間"
  /** 中央に大きく表示する値（数値でも文字でもOK） */
  value?: number | string
  /** 教材数カード下部の「進行中 XX 件」に使う件数 */
  activeCount?: number
  /** 進捗率カードのプログレス（0-100） */
  progressPct?: number
  /** 学習時間カードの「連続日数」表記に使う日数 */
  streakDays?: number
  className?: string
}

export default function ProjectStatsCard({
  title,
  value,
  activeCount,
  progressPct,
  streakDays,
  className,
}: Props) {
  // アイコンのマップ
  const icon =
    title === "教材数" ? (
      <BookOpen className="h-4 w-4 text-muted-foreground" />
    ) : title === "進捗率" ? (
      <BarChart3 className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Timer className="h-4 w-4 text-muted-foreground" />
    )

  return (
    <Card className={`p-4 h-40 flex flex-col justify-between ${className ?? ""}`}>
      {/* 上：タイトル＋アイコン */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {icon}
      </div>

      {/* 中央：数値 */}
      <div className="mt-2 text-2xl font-semibold leading-none">
        {title === "進捗率"
          ? typeof value === "number"
            ? `${value}%`
            : value ?? "0%"
          : value ?? 0}
      </div>

      {/* 下：補足テキスト or プログレスバー */}
      {title === "教材数" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          進行中 {activeCount ?? 0} 件
        </div>
      )}

      {title === "進捗率" && (
        <div className="mt-3">
          <Progress value={Number(progressPct ?? 0)} className="h-2" />
        </div>
      )}

      {title === "合計学習時間" && (
        <div className="mt-3 text-xs text-muted-foreground">連続日数 {streakDays ?? 0} 日</div>
      )}
    </Card>
  )
}
