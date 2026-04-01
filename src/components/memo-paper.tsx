import React from 'react'

export default function MemoPaper() {
    return (
        <div className="relative w-70 rotate-1 rounded-2xl bg-amber-50 p-6 shadow-lg h-50">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <div className="h-5 w-5 rounded-full bg-red-700 shadow-md ring-2 ring-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-stone-800">Memo</h3>
            <li className="text-sm text-stone-600">
                <ul>今日やること</ul>
                <ol>目標</ol>
                <ul>やり残したこと</ul>
            </li>
        </div>
    )
}
