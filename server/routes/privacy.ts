// routes/privacy.ts
import { Response, Router } from "express";
import User from "../models/User.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";
import { getUserPrivacy, UpdatePrivasy } from "../controllers/privacyController.js";

const router = Router();



// گرفتن تنظیمات فعلی
router.get("/", authMiddleware, getUserPrivacy);

// آپدیت یک فیلد خاص
router.patch("/", authMiddleware, UpdatePrivasy);

export default router;