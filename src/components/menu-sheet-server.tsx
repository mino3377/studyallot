import { createClient } from "@/utils/supabase/server";
import MenuSheetClient from "./menu-sheet-client";

export default async function MenuSheetServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <MenuSheetClient user={user} />;
}
