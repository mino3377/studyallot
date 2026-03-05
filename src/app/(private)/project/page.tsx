// src/app/(private)/project/page.tsx
import { getProjectPageData } from "./data"
import { requireUser } from "@/lib/auth/require-user"
import { ProjectPageBody} from "./page-body"
import { deleteMaterialAction, deleteProjectAction, replanDelayedPlansAction, saveSectionRecordsAction, updateMaterialOrdersAction, updateProjectMetaAction } from "./action"

export const metadata = { title: "Project | studyallot" }

export default async function ProjectPage() {
  const user = await requireUser()

  const { projects, materialsByProjectSlug } = await getProjectPageData(user.id)

  return (
    <div className="space-y-6 h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0">
        <ProjectPageBody
          projects={projects}
          materialsBySlug={materialsByProjectSlug}
          saveSectionRecordsAction={saveSectionRecordsAction}
          updateProjectMetaAction={updateProjectMetaAction}
          replanDelayedPlansAction={replanDelayedPlansAction}
          updateMaterialOrdersAction={updateMaterialOrdersAction}
          deleteMaterialAction={deleteMaterialAction}
          deleteProjectAction={deleteProjectAction}
        />
      </div>
    </div>
  )
}