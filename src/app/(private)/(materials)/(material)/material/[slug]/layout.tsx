//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\(material)\material\[slug]\layout.tsx

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SubHeader from "@/components/sub-header/sub-header";


export default async function MaterialLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: mat, error } = await supabase
    .from("materials")
    .select("title")
    .eq("slug", slug)
    .single();

  if (error || !mat) notFound();

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <SubHeader title={`教材`} />
      <div>{children}</div>
    </div>
  );
}
