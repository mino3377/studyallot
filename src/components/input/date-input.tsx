import { CalendarIcon } from "lucide-react"
import React from "react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"

type Props = {
    id: string,
    title: string,
    dateValue: Date,
    setDateValue: (date: Date) => void
    dateError: string | undefined
    isTextWhite?:boolean
}

export default function DateInput({ id, title, dateValue, setDateValue, dateError,isTextWhite }: Props) {


    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
               className={`text―sm font―semibold text―black/80 ${isTextWhite ? "text―white" : null}`}
            >
                {title}
            </label>

            <input
                type="hidden"
                name={id}
                id={id}
                value={dateValue ? format(dateValue, "yyyy-MM-dd") : ""}
            />


            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-full justify-between rounded-lg border border-black/15 bg-white px-3 text-sm font-normal text-black shadow-sm hover:border-black/30 hover:bg-white"
                    >
                        {dateValue ? format(dateValue, "yyyy-MM-dd") : "日付を選択"}
                        <CalendarIcon className="h-4 w-4 opacity-70" />
                    </Button>

                </PopoverTrigger>


                <PopoverContent className="w-auto rounded-lg border border-black/10 bg-white p-2 shadow-md">
                    <Calendar
                        mode="single"
                        required
                        selected={dateValue}
                        onSelect={setDateValue}
                    />
                </PopoverContent>
            </Popover>
            {dateError ? <div className="text-xs text-red-600">{dateError}</div> : undefined}
        </div>
    )
}