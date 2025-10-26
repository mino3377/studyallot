// app/(private)/(projects)/(project)/project/[slug]/layout.tsx
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SubHeader from "@/components/sub-header";

export default async function ProjectSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  // ← Promise<{ slug: string }> に変更
  params: Promise<{ slug: string }>;
}) {
  // ← 追加：params の await
  const { slug } = await params;

  const supabase = await createClient();

  // 認証チェック（必要なければ外してOK）
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");

  // プロジェクト名を取得（ユーザー所有のものに限定）
  const { data: proj, error } = await supabase
    .from("projects")
    .select("name")
    .eq("slug", slug)
    .eq("user_id", auth.user.id)
    .single();

  if (error || !proj) notFound();

  return (
    <div className="w-full px-4 md:px-6 py-6">
      <SubHeader title={`プロジェクト > ${proj.name}`} />
      <div>{children}</div>
    </div>
  );
}
