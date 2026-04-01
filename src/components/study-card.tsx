import React from 'react'

export default function StudyCard() {
  return (
    <div className='h-full flex flex-col'>
      <span className='h-5 text-sm font-semibold'>学習カード</span>
      <div className='rounded-2xl bg-amber-800/10 flex-1 boder-b shadow-md p-2'>

        <span className='text-muted-foreground/50'>front</span>
      </div>
    </div>
  )
}
