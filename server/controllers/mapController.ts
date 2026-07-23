import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import User from "../models/User.js";
import { broadcastMapUpdate } from "../socket/socketManager.js";

export const updateLocation = async (req: AuthRequest, res: Response) => {
    console.log('hello locataion')
  try {
    const userId = req.user?.id;
    const { latitude, longitude } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return res.status(400).json({ success: false, message: "مختصات نامعتبر است" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: { type: "Point", coordinates: [longitude, latitude] },
        lastSeen: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }

    if (user.isVisibleOnMap) {
      broadcastMapUpdate(userId, { latitude, longitude });
    }

    res.status(200).json({ success: true, message: "لوکیشن به‌روزرسانی شد" });
  } catch (error: any) {
    console.error("updateLocation error:", error);
    res.status(500).json({ success: false, message: error?.message || "خطای سرور" });
  }
};

export const toggleMapVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { isVisibleOnMap } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }
    if (typeof isVisibleOnMap !== "boolean") {
      return res.status(400).json({ success: false, message: "مقدار نامعتبر" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isVisibleOnMap },
      { new: true }
    );

    broadcastMapUpdate(userId, null, isVisibleOnMap);

    res.status(200).json({ success: true, isVisibleOnMap: user?.isVisibleOnMap });
  } catch (error: any) {
    console.error("toggleMapVisibility error:", error);
    res.status(500).json({ success: false, message: error?.message || "خطای سرور" });
  }
};

export const getNearbyUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude, maxDistanceKm = "20" } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "latitude و longitude الزامی است" });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const maxMeters = parseFloat(maxDistanceKm as string) * 1000;

    const users = await User.find({
      _id: { $ne: userId },
      isVisibleOnMap: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxMeters,
        },
      },
    })
      .select("name handle avatar location lastSeen")
      .limit(100)
      .lean();

    res.status(200).json({ success: true, users });
  } catch (error: any) {
    console.error("getNearbyUsers error:", error);
    res.status(500).json({ success: false, message: error?.message || "خطای سرور" });
  }
};