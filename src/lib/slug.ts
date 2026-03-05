//C:\Users\chiso\nextjs\study-allot\src\lib\slug.ts

import { nanoid } from "nanoid"

export type PublicIdPrefix = "p" | "m" | "t"

export function makePublicId(prefix: PublicIdPrefix) {
  return `${prefix}-${nanoid(12)}`
}
