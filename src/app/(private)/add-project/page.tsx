//C:\Users\chiso\nextjs\study-allot\src\app\(private)\add-project\page.tsx
import AddProjectForm from "@/app/(private)/add-project/add-project-form"
import { createProject } from "@/server/actions/projects"

export default function AddProjectPage() {
  return <AddProjectForm onSubmit={createProject} />
}
