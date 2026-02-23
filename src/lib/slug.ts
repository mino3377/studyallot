import { nanoid } from "nanoid"

export type PublicIdPrefix = "p" | "m"

export function makePublicId(prefix: PublicIdPrefix) {
  return `${prefix}-${nanoid(12)}`
}
