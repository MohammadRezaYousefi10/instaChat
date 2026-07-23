// utils/privacy.ts
import { IUser, PrivacyLevel } from "../models/User.js";

export function canView(
  viewerId: string | null,
  owner: IUser,
  field: keyof IUser["privacy"]
): boolean {
  if (viewerId && viewerId === owner._id) return true;

  const level: PrivacyLevel = owner.privacy?.[field] ?? "everyone";

  if (level === "everyone") return true;
  if (level === "nobody") return false;
  // level === "contacts"
  return owner.contacts?.includes(viewerId ?? "") ?? false;
}