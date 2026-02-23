// app/(private)/(materials)/(material)/material/[slug]/edit/data.ts
import "server-only"
import { cache } from "react"
import { getEditMaterialQuery } from "./queries"

export const preloadEditMaterial = (userId: string, materialSlug: string) => {
  void getEditMaterialData(userId, materialSlug)
}

export const getEditMaterialData = cache(async (userId: string, materialSlug: string) => {
  return getEditMaterialQuery(userId, materialSlug)
})
