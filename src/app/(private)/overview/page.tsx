import { monthLabelJP } from '@/lib/constant/period-label'
import React from 'react'
import PageBody from './page-body'
import { fetchMaterials, fetchProjects } from '@/lib/queries'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")
    const materialRow = await fetchMaterials(user.id)
    const projectRow = await fetchProjects(user.id)

    return (
        <PageBody materialRow={materialRow} projectRow={projectRow} />
    )
}