import { Slider } from "@/components/ui/slider"
import { weekLabel } from "@/lib/constant/period-label"
import { taskDistributeByDays } from "@/lib/task-distribute"
import React from "react"

type Props = {
  startDate: Date,
  endDate: Date,
  unitCount: number,
  rounds: number,
  initialTaskRatioRow?: number[] | null,
}

export default function MaterialTaskRegisterPanel({
  startDate,
  endDate,
  unitCount,
  rounds,
  initialTaskRatioRow
}: Props) {

  const [taskRatioRow, setTaskRatioRow] = React.useState<number[]>(
    initialTaskRatioRow && initialTaskRatioRow.length === 7
      ? initialTaskRatioRow
      : Array.from({ length: 7 }, (_) => 1)
  )

  const daysTaskRow = taskDistributeByDays({ startDate, endDate, unitCount, rounds, taskRatioRow })

  function handleTaskRatioValue(index: number, value: number[]) {
    setTaskRatioRow((prev) =>
      prev.map((v, i) => (i === index ? value[0] : v))
    )
  }

  return (
    <div className="space-y-3 rounded-2xl p-3 lg:h-full ">
      <div className="h-12">
        <div className="text-2xl font-semibold ">タスク配分</div>
        <div className="text-xs text-muted-foreground ml-6">─ 曜日ごとのタスク比率</div>
      </div>

      <div className="h-full">
        {weekLabel.map((week, index) => {
          const averageTaskCount =
            daysTaskRow[index].length === 0
              ? 0
              : Math.round((daysTaskRow[index].reduce((sum, day) => sum + day.taskCount, 0) / daysTaskRow[index].length) * 10) / 10

          return (
            <div key={week} className="h-1/8">
              <TaskRatioSlider
                id={week}
                taskRatioValue={taskRatioRow[index]}
                averageTaskCount={averageTaskCount}
                onTaskRatioValueChange={(value) => handleTaskRatioValue(index, value)}
              />
            </div>
          )
        })}
        <input type="hidden" name={"taskratiorow"} value={JSON.stringify(taskRatioRow)} />
      </div>
    </div>
  )
}

type TaskRatioSliderProps = {
  id: string,
  taskRatioValue: number,
  averageTaskCount: number,
  onTaskRatioValueChange: (value: number[]) => void
}

function TaskRatioSlider({
  id,
  taskRatioValue,
  averageTaskCount,
  onTaskRatioValueChange
}: TaskRatioSliderProps) {

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-black/80">
          {id}
        </label>
        <span className="text-sm font-medium text-black/60">{taskRatioValue}</span>
      </div>

      <Slider
        id={id}
        name={id}
        value={[taskRatioValue]}
        min={0}
        max={10}
        step={1}
        onValueChange={onTaskRatioValueChange}
        className="w-full"
      />

      <div className="text-xs text-black/50">
        平均タスク数: {averageTaskCount}
      </div>
    </div>
  )
}