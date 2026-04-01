import React from "react"
import { Input } from "../ui/input"

type Props = {
    id: string,
    title: string,
    numberValue: string,
    setNumberValue: (e: React.ChangeEvent<HTMLInputElement>) => void
    numberError: string | undefined
    isTextWhite?:boolean
}

export default function NumberInput({ id, title, numberValue, setNumberValue, numberError,isTextWhite }: Props) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className={`text―sm font―semibold text―black/80 ${isTextWhite ? "text―white" : null}`}
            >
                {title}
            </label>
            <Input
                type="number"
                step={1}
                name={id}
                max={1000}
                id={id}
                value={numberValue}
                onChange={setNumberValue}
                className="h-9 w-full rounded-lg border border-black/15 bg-white px-3 text-sm shadow-sm transition-colors hover:border-black/30 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {numberError ? <div className="text-xs text-red-600">{numberError}</div> : undefined}
        </div>
    )
}