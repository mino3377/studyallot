import React from "react"
import { Textarea } from "@/components/ui/textarea"

type Props = {
    id: string,
    title: string,
    textValue: string,
    onTextValueChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    inputError: string | undefined,
    placeholder: string,
    isTextWhite?:boolean
}

export default function TextAreaInput({ id, title, onTextValueChange, inputError, textValue, placeholder,isTextWhite }: Props) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className={`text―sm font―semibold text―black/80 ${isTextWhite ? "text―white" : null}`}
            >
                {title}
            </label>

            <Textarea
                name={id}
                id={id}
                rows={6}
                placeholder={placeholder}
                value={textValue}
                onChange={onTextValueChange}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:border-black/30 focus-visible:ring-0 focus-visible:ring-offset-0"
            />


            <div className="flex justify-between">
                <div>
                    {inputError ? <div className="text-xs text-red-600">{inputError}</div> : undefined}
                </div>
                <div className="pointer-events-none text-[10px] text-black/45">
                    {textValue.length}
                </div>
            </div>


        </div>
    )
}