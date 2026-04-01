"use client"


import { monthLabel, weekLabel } from '@/lib/constant/period-label'
import { Divide, MoveLeft, MoveRight } from 'lucide-react'
import React from 'react'

type Props = {
  selectedDay:Date,
  displayDate:Date,
  setSelectedDay:(day:Date)=>void,
  setDisplayDate:(date:Date)=>void
}

export default function MonthCalender({
selectedDay,
displayDate,
setSelectedDay,
setDisplayDate

}:Props) {



  let isSelected: boolean = false

  //今の月
  const currentYear = new Date(displayDate).getFullYear()
  const currentMonth = new Date(displayDate).getMonth()

  const startDay = new Date(currentYear, currentMonth, 1).getDay()
  const endDate = new Date(currentYear, currentMonth + 1, 0).getDate()
  const endDay = new Date(currentYear, currentMonth + 1, 0).getDay()

  //前の月
  const prevDisplayEndDate = new Date(currentYear, currentMonth, 0)
  const prevEndYear = prevDisplayEndDate.getFullYear()
  const prevEndMonth = prevDisplayEndDate.getMonth()
  const prevEndDate = prevDisplayEndDate.getDate()

  //次の月
  const nextStartDate = new Date(currentYear, currentMonth + 1, 1)

  //現在の表示月の全日付の配列３つ
  let prevRow = []
  for (let i = 0; i < startDay; i++) {
    prevRow.push(new Date(prevEndYear, prevEndMonth, prevEndDate - i))
  }
  prevRow.reverse()

  let currentRow = []
  for (let i = 0; i < endDate; i++) {
    currentRow.push(new Date(currentYear, currentMonth, i + 1))
  }

  let nextRow = []
  for (let i = 0; i < 6 - endDay; i++) {
    nextRow.push(new Date(currentYear, currentMonth + 1, i + 1))
  }

  //カレンダーの日付配列

  const days: Date[] = [
    ...prevRow,
    ...currentRow,
    ...nextRow
  ]

  function handleLeftButton() {
    const prevMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1)
    setDisplayDate(prevMonth)
  }
  function handleRightButton() {
    const prevMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1)
    setDisplayDate(prevMonth)
  }
  function handleSelectedDay(day: Date) {
    isSelected = true
    setSelectedDay(day)
  }

  return (
    <div className='w-full lg:h-full'>
      <div className='flex items-center justify-between'>
        <div className='font-semibold text-xl text-center mb-1'>
          {`${monthLabel[currentMonth]} ${currentYear}`}
        </div>
        <div className='gap-3 flex justify-center items-center'>
          <MoveLeft type="button" onClick={handleLeftButton} className='rounded-full size-8 hover:bg-muted p-2 border' />
          <MoveRight type="button" onClick={handleRightButton} className='rounded-full size-8 hover:bg-muted p-2 border' />
        </div>
      </div>
      <div className='grid grid-cols-7 text-center text-sm'>
        {weekLabel.map((day, idx) => {
          return <div key={`${idx}`} className="rounded-2xl  mx-auto  font-bold  size-10 flex items-center justify-center">
            {day}
          </div>
        })}
      </div>
      <div className='grid grid-cols-7 text-sm'>
        {days.map((day) => {
          return (
            <button
              type="button"
              onClick={() => handleSelectedDay(day)}
              key={`${day}`}
              className={`rounded-full mx-auto size-10 flex items-center justify-center
                 ${day.getFullYear() === selectedDay.getFullYear() &&
                  day.getMonth() === selectedDay.getMonth() &&
                  day.getDate() === selectedDay.getDate()
                  ? "bg-black text-white hover:bg-black/70"
                  : "hover:bg-muted-foreground/70"
                }`}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
