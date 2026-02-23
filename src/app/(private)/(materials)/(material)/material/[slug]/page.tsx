// app/(private)/(materials)/(material)/material/[slug]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getTodayISOForUser } from "@/lib/user-tz";
import MaterialPageBody from "./page-body";
import { preloadMaterialData } from "./data";

export const metadata = { title: "Material | studyallot" };

export default async function MaterialDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) redirect("/login");

  const { slug: materialSlug } = await params;
  const { tz, todayISO } = await getTodayISOForUser(auth.user.id);

  console.log("[MaterialDetailPage]", {
    userId: auth.user.id,
    materialSlug,
    todayISO,
    tz,
  });

  preloadMaterialData(auth.user.id, materialSlug, todayISO, tz);

  return (
    <MaterialPageBody
      userId={auth.user.id}
      materialSlug={materialSlug}
      todayISO={todayISO}
      userTZ={tz}
    />
  );
}
