import { AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import User from "../models/User.js";



export const syncUsersWithContact = async (req: AuthRequest, res: Response) => {

  const { phones } = req.body as { phones: string[] };
  if (!Array.isArray(phones) || phones.length === 0) {
    return res.json({ success: true, registered: [] });
  }

  const normalized = [...new Set(phones.filter(Boolean))];
  //console.log('we have to send users ' , normalized)
  const users = await User.find({
    phone: { $in: normalized },
    _id: { $ne: req.user!.id },
  })
    .select("name handle avatar phone")
    .limit(500);

    //console.log('we have to send users ' , users)

  res.json({ success: true, registered: users });
}