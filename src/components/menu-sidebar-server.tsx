import { createClient } from "@/utils/supabase/server";
import MenuSidebarClient from "./menu-sidebar-client";

export default async function MenuSidebarServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <MenuSidebarClient user={user} />;
}
