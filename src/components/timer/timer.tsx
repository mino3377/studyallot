"use client"

import { useEffect, useMemo, useState, type SetStateAction } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"
import TimerSettingsDialog from "./timer-settings-dialog"

type Mode = "focus" | "break"

export default function Timer() {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [totalSets, setTotalSets] = useState(4)

  const [mode, setMode] = useState<Mode>("focus")
  const [currentSet, setCurrentSet] = useState(1)
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)

  const currentTotalSeconds = useMemo(
    () => (mode === "focus" ? focusMinutes : breakMinutes) * 60,
    [mode, focusMinutes, breakMinutes]
  )

  useEffect(() => {
    if (!running) return

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1

        if (mode === "focus") {
          if (currentSet >= totalSets) {
            setRunning(false)
            return 0
          }
          setMode("break")
          return breakMinutes * 60
        }

        setMode("focus")
        setCurrentSet((s) => s + 1)
        return focusMinutes * 60
      })
    }, 1000)

    return () => clearInterval(id)
  }, [running, mode, currentSet, totalSets, focusMinutes, breakMinutes])

  function resetTimerWithFocus(nextFocusMinutes: number) {
    setMode("focus")
    setCurrentSet(1)
    setTimeLeft(nextFocusMinutes * 60)
  }

  function handleFocusMinutesChange(value: SetStateAction<number>) {
    setFocusMinutes((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : value
      resetTimerWithFocus(nextValue)
      return nextValue
    })
  }

  function handleBreakMinutesChange(value: SetStateAction<number>) {
    setBreakMinutes((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : value
      resetTimerWithFocus(focusMinutes)
      return nextValue
    })
  }

  function handleTotalSetsChange(value: SetStateAction<number>) {
    setTotalSets((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : value
      resetTimerWithFocus(focusMinutes)
      return nextValue
    })
  }

  const progress = currentTotalSeconds === 0 ? 0 : timeLeft / currentTotalSeconds

  const min = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const sec = String(timeLeft % 60).padStart(2, "0")

  function handleToggle() {
    setRunning((prev) => !prev)
  }

  function handleReset() {
    setRunning(false)
    setMode("focus")
    setCurrentSet(1)
    setTimeLeft(focusMinutes * 60)
  }

  return (
    <div className="flex h-full w-full items-center min-h-0">
      <div className="flex items-center justify-between w-full h-full min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 items-center p-1 min-w-0 w-full">
          <div className="relative aspect-square h-5/6 w-full max-w-full min-h-0">
            <svg className="h-full w-full" viewBox="0 0 120 120">
              <path
                d="
      M 60 10
      H 86
      Q 110 10 110 34
      V 86
      Q 110 110 86 110
      H 34
      Q 10 110 10 86
      V 34
      Q 10 10 34 10
      H 60
    "
                fill="none"
                stroke="#808080"
                strokeWidth="10"
                strokeLinecap="round"
                pathLength={100}
              />
              <path
                d="
      M 60 10
      H 86
      Q 110 10 110 34
      V 86
      Q 110 110 86 110
      H 34
      Q 10 110 10 86
      V 34
      Q 10 10 34 10
      H 60
    "
                fill="none"
                stroke={mode === "focus" ? "#F2F2F2" : "#CCCCCC"}
                strokeWidth="10"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - progress * 100}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] leading-tight text-center text-white">
                {currentSet}/{totalSets}セット目
                <br />
                {mode === "focus" ? "集中" : "休憩"}
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white">
                {min}:{sec}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col shrink-0 items-center justify-center gap-2 min-h-0">
            <button
              onClick={handleReset}
              className="rounded-full border bg-white/50 border-black/10 p-2.5 text-white transition hover:bg-white/30"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              onClick={handleToggle}
              className="rounded-full bg-white/90 p-2.5 text-black transition hover:opacity-70"
            >
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>

            <TimerSettingsDialog
              focusMinutes={focusMinutes}
              breakMinutes={breakMinutes}
              totalSets={totalSets}
              setFocusMinutes={handleFocusMinutesChange}
              setBreakMinutes={handleBreakMinutesChange}
              setTotalSets={handleTotalSetsChange}
              disabled={running}
            />
          </div>
        </div>
      </div>
    </div>
  )
}