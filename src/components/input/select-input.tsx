import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

type options = {
  id: string | number,
  title: string
}

type Props = {
  id: string
  title: string
  value: string | undefined
  options: options[]
  onChangeValue: (e: React.ChangeEvent<HTMLSelectElement>) => void
  selectError?:string
  isTextWhite?:boolean
}

export default function SelectInput({
  id,
  title,
  value,
  options,
  onChangeValue,
  selectError,
  isTextWhite
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`text―sm font―semibold text―black/80 ${isTextWhite ? "text―white" : null}`}
      >
        {title}
      </label>
      <input type="hidden" name={id} value={value ?? ""} />


      <Select
        value={value}
        onValueChange={(nextValue) => {
          onChangeValue({
            target: { value: nextValue, name: id, id },
          } as React.ChangeEvent<HTMLSelectElement>)
        }}
      >
        <SelectTrigger
          id={id}
          className="h-9 w-full rounded-lg border border-black/15 bg-white px-3 text-sm shadow-sm transition-colors hover:border-black/30 focus:ring-0 focus:outline-none"
        >
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>

        <SelectContent className="rounded-lg border border-black/10 bg-white shadow-md">
          {options.map((option) => (
            <SelectItem
              key={`${option.id}`}
              value={`${option.id}`}
              className="rounded-md text-sm focus:bg-black/5"
            >
              {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectError?<div className="text-xs text-red-600">{selectError}</div>:null}
    </div>
  )
}