import React from 'react'
import PageBody from './page-body'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { fetchMaterialsByProjectIds, fetchProjects } from '@/lib/queries'
import { errorToast } from '@/components/toast'
import { generateProjectIdRow } from '@/lib/data'
import { Project } from '@/lib/type/project_type'
import { Material } from '@/lib/type/material_type'

export default async function page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const projectRow = await fetchProjects(user.id)

    let projectIdRow: number[] = []

    if (projectRow)
        projectIdRow = generateProjectIdRow(projectRow)

    const materialRow = await fetchMaterialsByProjectIds(user.id, projectIdRow)

    return (
        <PageBody
            userId={user.id}
            projectRow={projectRow}
            materialRow={materialRow}
        />
    )
}
