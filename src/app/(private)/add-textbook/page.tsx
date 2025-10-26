// C:\Users\chiso\nextjs\study-allot\src\app\(private)\add-textbook\page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AddTextbookClient from "./AddTextbookClient";
import { createMaterial } from "@/server/actions/materials";
import type { ProjectOption } from "@/components/materials/BasicInfoCard";

export const metadata = {
  title: "Add Textbook | studyallot",
};

export default async function AddTextbookPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");

  // プロジェクト候補を取得（このユーザーのもの）
  const { data: projectRows } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", auth.user.id)
    .order("name", { ascending: true });

  const projects: ProjectOption[] = (projectRows ?? []).map((p) => ({
    id: String(p.id),
    name: p.name,
  }));

  // Client へ渡す server action（成功時は内部で redirect、失敗時は throw）
  async function createMaterialAction(input: unknown): Promise<void> {
    "use server";
    await createMaterial(input);
  }

  return <AddTextbookClient action={createMaterialAction} projects={projects} />;
}
