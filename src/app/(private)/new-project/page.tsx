// C:\Users\chiso\nextjs\study-allot\src\app\(private)\add-project\page.tsx
import AddProjectForm from "@/app/(private)/new-project/page-body"
import { createProject } from "./action"

export default function AddProjectPage() {
  return <AddProjectForm onSubmit={createProject} />
}
