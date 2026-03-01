// src/app/(private)/daily-task/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DailyTaskPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");
}
