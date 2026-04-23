import { Material } from "@/lib/type/material_type"
import React from "react"
import SimpleStatsCard from "@/components/stats-card/simple-stats-card"
import MonthCalender from "@/components/calender-and-daily-task/month-calender"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

type Props = {
  material: Material | null
}

const mockRecordRow = [
  {
    date: "2026-03-27",
    taskCount: 4,
    studyTime: "2.5h",
    content: "第1章 需要と供給 / 練習問題 1〜10",
  },
  {
    date: "2026-03-26",
    taskCount: 3,
    studyTime: "1.5h",
    content: "第2章 消費者理論 前半",
  },
  {
    date: "2026-03-25",
    taskCount: 5,
    studyTime: "3.0h",
    content: "第1章 復習 / 第2章 問題演習",
  },
  {
    date: "2026-03-24",
    taskCount: 2,
    studyTime: "1.0h",
    content: "第3章 導入部分を読む",
  },
]

export default function MaterialEditorPageBody({ material }: Props) {
  if (!material) {
    return <div>教材がありません</div>
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-stone-200">
      <div className="relative grid h-full min-h-0 grid-cols-7 p-2">
        <div className="col-span-5 h-full min-h-0 pr-2">
          <div className="flex h-full min-h-0 flex-col gap-4">
            {/* 上部：教材タイトル + 編集ボタン */}
            <div className="flex items-center justify-between rounded-2xl border bg-white px-6 py-5 shadow-sm">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  Material Detail
                </p>
                <h1 className="truncate text-2xl font-bold text-foreground">
                  例：ミクロ経済学 基礎問題精講
                </h1>
              </div>

              <Button className="rounded-xl">
                <Pencil className="mr-2 h-4 w-4" />
                編集ページへ
              </Button>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
              {/* 左側 */}
              <div className="col-span-1 flex h-full min-h-0 flex-col justify-center gap-2">
                <div className="min-h-0 rounded-2xl bg-green-900/10 shadow-md">
                  <div className="grid grid-cols-3 font-semibold">
                    <div>
                      <SimpleStatsCard title="総タスク数" stats={48} unit="コ" />
                    </div>
                    <div className="border-l-2">
                      <SimpleStatsCard title="進捗率" stats={62} unit="%" />
                    </div>
                  </div>
                </div>

                {/* 記録一覧 */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="border-b px-4 py-3">
                    <h2 className="text-sm font-semibold">学習記録</h2>
                    <p className="text-xs text-muted-foreground">
                      日付・タスク数・勉強時間・内容を表示
                    </p>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-12 border-b bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground">
                      <div className="col-span-2">日付</div>
                      <div className="col-span-2">タスク数</div>
                      <div className="col-span-2">勉強時間</div>
                      <div className="col-span-6">内容</div>
                    </div>

                    <div className="divide-y">
                      {mockRecordRow.map((record) => (
                        <div
                          key={`${record.date}-${record.content}`}
                          className="grid grid-cols-12 items-start px-4 py-3 text-sm"
                        >
                          <div className="col-span-2 text-muted-foreground">
                            {record.date}
                          </div>
                          <div className="col-span-2 font-medium">
                            {record.taskCount}
                          </div>
                          <div className="col-span-2 font-medium">
                            {record.studyTime}
                          </div>
                          <div className="col-span-6 leading-6 text-foreground/90">
                            {record.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 右側 */}
              <div className="col-span-1 flex h-full min-h-0 flex-col gap-4">
                <div className="grid h-1/3 min-h-0 grid-cols-2 gap-4">
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">
                      平均学習時間
                    </p>
                    <p className="mt-3 text-3xl font-bold">1.8h</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      1日あたりの平均
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">
                      連続学習日数
                    </p>
                    <p className="mt-3 text-3xl font-bold">6日</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      直近の継続記録
                    </p>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="mb-3">
                    <h2 className="text-sm font-semibold">学習時間の推移</h2>
                    <p className="text-xs text-muted-foreground">
                      日別または週別の統計を表示予定
                    </p>
                  </div>

                  <div className="min-h-0 flex-1">
                    バーチャート予定
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右サイド */}
        <div className="-my-2 -mr-2 col-span-2 flex flex-col space-y-2 bg-green-900/10 p-2">
          <div className="flex h-4/7 w-full items-start justify-center rounded-2xl bg-white p-3 shadow-md">

          </div>

          <div className="flex h-3/7 min-h-0 flex-col justify-center rounded-2xl bg-white p-4 shadow-md">
            <div className="mb-3">
              <h2 className="text-sm font-semibold">教材データ</h2>
              <p className="text-xs text-muted-foreground">
                教材情報や追加統計をここに表示
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">開始日</p>
                <p className="mt-2 text-sm font-semibold">2026-03-01</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">終了予定日</p>
                <p className="mt-2 text-sm font-semibold">2026-04-10</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">周回数</p>
                <p className="mt-2 text-sm font-semibold">3周</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">単位数</p>
                <p className="mt-2 text-sm font-semibold">42章</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}