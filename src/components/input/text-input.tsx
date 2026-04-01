import React from "react"
import { Input } from "../ui/input"

type Props = {
  id: string
  title: string|undefined
  textValue: string
  onTextValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputError: string | undefined
  isTextWhite?: boolean
}

export default function TextInput({
  id,
  title,
  onTextValueChange,
  inputError,
  textValue,
  isTextWhite,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {title ?
        <label
          htmlFor={id}
          className={`text-sm font-semibold ${isTextWhite ? "text-white" : "text-black/80"}`}
        >
          {title}
        </label>
        :
        null
      }


      <div className="relative">
        <Input
          type="text"
          name={id}
          id={id}
          value={textValue}
          onChange={onTextValueChange}
          className="h-9 w-full rounded-lg border border-black/15 bg-white px-3 pr-10 text-sm shadow-sm transition-colors hover:border-black/30 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-black/45">
          {textValue.length}
        </div>
      </div>

      {inputError ? (
        <div className="text-xs text-red-600">{inputError}</div>
      ) : null}
    </div>
  )
}