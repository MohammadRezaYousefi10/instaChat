import { AuthRequest } from "../middlewares/auth.js";
import User from "../models/User.js";
import { Response } from "express";


const ALLOWED_FIELDS = ["phoneNumber", "lastSeen", "profilePhoto", "bio", "calls"] as const;
const ALLOWED_VALUES = ["everyone", "contacts", "nobody"] as const;



export const getUserPrivacy =  async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await User.findById(userId).select("privacy");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, privacy: user.privacy });
}

export const UpdatePrivasy =  async (req: AuthRequest, res: Response) => {

  const { field, value } = req.body as { field: string; value: string };
  console.log("req.body ",req.body)

  if (!ALLOWED_FIELDS.includes(field as any)) {
    return res.status(400).json({ success: false, message: "Invalid field" });
  }
  if (!ALLOWED_VALUES.includes(value as any)) {
    return res.status(400).json({ success: false, message: "Invalid value" });
  }
  
  const userId = req.user!.id;
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { [`privacy.${field}`]: value } },
    { returnDocument: "after" }
  ).select("privacy");



  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  res.json({ success: true, privacy: user.privacy });
}