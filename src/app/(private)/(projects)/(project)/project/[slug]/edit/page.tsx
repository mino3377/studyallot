// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\edit\page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import EditProjectForm from "./edit-project-form"
import { updateProject } from "@/server/actions/projects"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect("/login")

  const { data: proj, error: fetchErr } = await supabase
    .from("projects")
    .select("id, slug, name, category, goal, notes, weekly_hours")
    .eq("slug", slug)
    .eq("user_id", auth.user.id)
    .single()

  if (fetchErr || !proj) notFound()

  // ここで non-null に束ね直す
  const project = proj!

  // Server Action をクライアントに渡す
  async function updateProjectAction(fd: FormData) {
    "use server"
    return updateProject({ fd, projectId: project.id, slug: project.slug })
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="font-bold text-2xl">「{project.name}」の編集</header>
      <EditProjectForm
        initial={{
          slug: project.slug,
          name: project.name ?? "",
          purpose: (project.category as any) ?? "other",
          goal: project.goal ?? "",
          notes: project.notes ?? "",
          weeklyHours: (project.weekly_hours ?? "").toString(),
        }}
        onSubmit={updateProjectAction}
      />
    </div>
  )
}
