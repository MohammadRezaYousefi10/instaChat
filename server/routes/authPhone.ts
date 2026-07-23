// routes/authPhone.ts
import { Response, Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { saveOtp, verifyOtp } from "../services/otpStore.js";
import { sendMelipayamakOtp } from "../services/melipayamak.js";
import User from "../models/User.js";
//import { clerkClient } from "@clerk/clerk-sdk-node"; // یا @clerk/express بسته به نسخه‌ت
import { clerkClient } from "@clerk/express"; // یا @clerk/express بسته به نسخه‌ت

const router = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send-code", authMiddleware, async (req: AuthRequest, res: Response) => {
  // console.log(req.body)
  const { phone } = req.body as { phone: string };

  

  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed || !parsed.isValid()) {
    return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  const e164 = parsed.number; // مثلا +989123456789
  const isIran = e164.startsWith("+98");

  if (isIran) {
    const code = generateCode();
    saveOtp(e164, code);
    try {
      await sendMelipayamakOtp(e164, code);
    } catch (err) {
      console.error("melipayamak error:", err);
      return res.status(502).json({ success: false, message: "Failed to send SMS" });
    }
    return res.json({ success: true, provider: "melipayamak" });
  }

  // غیر ایران → از طریق Clerk
  // نکته: روش صحیح Clerk اینه که verification از سمت فرانت با useSignIn/useUser انجام بشه
  // (چون Clerk خودش کد رو مدیریت و می‌فرسته). این endpoint فقط برای یکدست کردن API خودمونه:
  return res.json({ success: true, provider: "clerk" });
  // فرانت‌اند وقتی provider==="clerk" دریافت کرد، باید خودش با Clerk SDK ادامه بده (بخش ۶)
});

router.post("/verify-code", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { phone, code } = req.body as { phone: string; code: string };

  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed || !parsed.isValid()) {
    return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  const e164 = parsed.number;
  const isIran = e164.startsWith("+98");

  if (!isIran) {
    return res.status(400).json({
      success: false,
      message: "Non-Iranian numbers must be verified via Clerk on the client",
    });
  }

  const ok = verifyOtp(e164, code);
  if (!ok) {
    return res.status(400).json({ success: false, message: "Invalid or expired code" });
  }

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: { phone: e164 } },
    { new: true }
  );

  res.json({ success: true, user });
});

export default router;