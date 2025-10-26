//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[id]\layout.tsx

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SubHeader from "@/components/sub-header";

export default async function MaterialLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: mat, error } = await supabase
    .from("materials")
    .select("title")
    .eq("id", Number(id))
    .single();

  if (error || !mat) notFound();

  return (
    <div className="w-full px-4 md:px-6 py-6">
      <SubHeader title={`マテリアル > ${mat.title}`} />
      <div>{children}</div>
    </div>
  );
}
