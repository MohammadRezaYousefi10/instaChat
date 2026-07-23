// routes/geo.ts
import { Response, Router } from "express";
import geoip from "geoip-lite";
import { AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/detect-country", (req: AuthRequest, res: Response) => {
  // اگه پشت پراکسی/nginx هستی، حتما app.set("trust proxy", true) رو ست کن
  
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "";

    const geo = geoip.lookup(ip);
   /*  console.log(ip)
    console.log(geo) */
  const country = geo?.country ?? "IR"; // fallback پیش‌فرض

  res.json({ success: true, country });
});

export default router;