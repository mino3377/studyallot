"use client"

import React, { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Field, FieldGroup } from "../ui/field"
import SaveButton from "./save-button"
import TextInput from "../input/text-input"
import { projectBaseSchema } from "@/lib/validators/project"
import { errorToast } from "../toast"
import { saveProject } from "@/lib/action"

export default function ProjectAddButton() {
  const [open, setOpen] = React.useState<boolean>(false)

  const [titleValue, setTitleValue] = React.useState<string>("")
  const [titleError, setTitleError] = React.useState<string | undefined>(undefined)

  const [isCompleted, setIsCompleted] = React.useState<boolean>(false)
  const [allErrorMessage, setAllErrorMessage] = React.useState<string | undefined>(undefined)

  function handleTextValue(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value

    const parsedResult = projectBaseSchema.shape.title.safeParse(v)

    if (!parsedResult.success) {
      setTitleError(parsedResult.error.issues[0].message)
    } else {
      setTitleError(undefined)
    }

    setTitleValue(v)
  }

  React.useEffect(() => {
    const rowData = {
      title: titleValue,
    }

    const result = projectBaseSchema.safeParse(rowData)

    if (!result.success) {
      setAllErrorMessage(result.error.issues[0].message)
      setIsCompleted(false)
    } else {
      setAllErrorMessage(undefined)
      setIsCompleted(true)
    }
  }, [titleValue])

  const isDisabled: boolean = !isCompleted

  async function handleSubmit(formData: FormData) {

    const result = await saveProject(formData)

    if (!result.ok) {
      errorToast(result.message)
    } else {
      setOpen(false)
      setTitleValue("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="lg:h-10 rounded-md text-xs bg-linear-to-b from-black to-white/30 lg:px-8 text-white hover:bg-black/40">
          <Plus className="size-4" />
          プロジェクト作成
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm ">
        <form action={handleSubmit} className="h-full flex flex-col space-y-2">
          <DialogHeader>
            <DialogTitle className="m-1 leading-normal">{`プロジェクト新規登録`}</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4 h-full min-h-0 overflow-y-auto">
            <Field>
              <TextInput
                id={"title"}
                title={"プロジェクト名"}
                textValue={titleValue}
                onTextValueChange={handleTextValue}
                inputError={titleError}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <SaveButton
              isDisabled={isDisabled}
              errorMessage={allErrorMessage}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}