// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\edit\page-body.tsx
import {notFound } from "next/navigation"
import EditProjectForm from "./client"
import { loadEditProjectData } from "./data"
import { updateProject } from "./action"

export default async function EditProjectPageBody(props: {
    slug: string
    userId: string
}) {
    const data = await loadEditProjectData(props.userId, props.slug)

    if (!data) notFound()

    const { projectId, initial } = data!

    async function onSubmit(fd: FormData) {
        "use server"
        return updateProject({ fd, projectId: projectId, slug: initial.slug })
    }

    return (
        <div className="flex flex-col gap-3 mb-3">
            <header className="font-bold text-2xl">「{data.initial.name}」の編集</header>
            <EditProjectForm initial={data.initial} onSubmit={onSubmit} />
        </div>
    )
}
