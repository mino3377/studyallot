// app/(private)/(materials)/(material)/material/[slug]/data.ts
import "server-only";
import { cache } from "react";
import { getMaterialDetailVM } from "./queries";

export const getMaterialData = cache(
  async (userId: string, materialSlug: string, todayISO: string, userTZ: string) => {
    return getMaterialDetailVM(userId, materialSlug, todayISO, userTZ);
  }
);

export function preloadMaterialData(userId: string, materialSlug: string, todayISO: string, userTZ: string) {
  void getMaterialData(userId, materialSlug, todayISO, userTZ);
}
