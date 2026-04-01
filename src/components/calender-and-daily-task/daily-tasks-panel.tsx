import { MaterialTaskMap } from '@/app/(private)/dashboard/page-body'
import { monthLabel, monthLabelJP } from '@/lib/constant/period-label'
import { iso } from '@/lib/date/date'
import { NotebookPen } from 'lucide-react'
import React from 'react'

type Props = {
  selectedDay: Date,
  materialTaskMapRow: MaterialTaskMap[]
}

export default function DailyTasksPanel({
  selectedDay,
  materialTaskMapRow
}: Props) {

  const Year = selectedDay.getFullYear()
  const MonthNum = selectedDay.getMonth()
  const Date = selectedDay.getDate()

  const selectedDayString = iso(selectedDay)

  const taskMapRow = materialTaskMapRow.map((m) => {
    const task = m.taskMap[selectedDayString]
    return { material: m.material, task: task }
  })

  const hasTask = taskMapRow.some((m) => m.task)

  return (
    <div className='lg:h-full min-h-0 flex flex-col gap-2 w-full p-2'>
      <div className='h-10 shrink-0 p-1 text-lg text-white flex justify-center mb-2 -mx-2'>
        {`${Year}年 ${monthLabelJP[MonthNum]} ${Date}日 `}
      </div>

      <div className='min-h-0 lg:flex-1 space-y-3 overflow-y-auto flex flex-col items-start'>
        {!hasTask ?
          <div className='text-sm flex justify-center w-full'>タスクはありません</div>
          :
          (taskMapRow.map((m) =>
            m.task ? (
              <div key={`${m.material.id}`} className='w-full'>
                <div className='flex items-center gap-2'>
                  <NotebookPen className='size-4 text-muted-foreground' />
                  {`${m.material.title}`}
                  <p className='text-sm'> {`${m.task}タスク`}</p>
                </div>
                <div className='h-[0.5px] w-full bg-black/60' />
              </div>
            ) : null
          ))}

      </div>
    </div>
  )
}