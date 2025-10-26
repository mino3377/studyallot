"use client"

import { useState, FormEvent, useTransition } from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import ProjectBasicInfoCard from "@/components/projects/ProjectBasicInfoCard"
import ProjectNotesCard from "@/components/projects/ProjectNotesCard"
import { PURPOSE_LABEL, type Purpose } from "@/lib/type/project"

type Props = { 
  onSubmit: (fd: FormData) => Promise<{ ok: boolean; message?: string } | void> 
}

export default function AddProjectForm({ onSubmit }: Props) {
  const [name, setName] = useState("")
  const [purpose, setPurpose] = useState<Purpose>("license")
  const [goal, setGoal] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set("name", name)
    fd.set("purpose", purpose)
    fd.set("goal", goal)
    fd.set("notes", notes)

    startTransition(async () => {
      const res = await onSubmit(fd)
      if (res && "ok" in res && !res.ok) setError(res.message ?? "作成に失敗しました。")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProjectBasicInfoCard
        name={name}
        onChangeName={setName}
        purpose={purpose}
        onChangePurpose={setPurpose}
        goal={goal}
        onChangeGoal={setGoal}
      />


      <ProjectNotesCard notes={notes} onChangeNotes={setNotes} />

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost"><Link href="/project">キャンセル</Link></Button>
        <Button type="submit" className="px-6" disabled={isPending}>
          {isPending ? "作成中…" : "作成する"}
        </Button>
      </div>
    </form>
  )
}
