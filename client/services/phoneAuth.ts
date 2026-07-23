// client/services/phoneAuth.ts
import { api, useApp } from "@/context/AppContext";
import { useUser } from "@clerk/expo";

export function usePhoneAuth() {
  // const { user } = useUser(); // send code with clerk in this page
  const { auth } = useApp();
  
  const user = auth.user;
  //console.log('user : ' , user)

  // مرحله ۱: ارسال کد
  const sendCode = async (e164Phone: string) => {
    const { data } = await api.post<{ success: boolean; provider: "melipayamak" | "clerk" }>(
      "/api/auth/phone/send-code",
      { phone: e164Phone }
    );

   /*  if (data.provider === "clerk") {
      // برای غیر ایرانی‌ها: خود Clerk کد رو می‌فرسته
      const phoneNumberResource = await user?.createPhoneNumber({ phoneNumber: e164Phone });
      await phoneNumberResource?.prepareVerification();
    } */

    return data.provider;
  };

  // مرحله ۲: تایید کد
  const verifyCode = async (
    e164Phone: string,
    code: string,
    provider: "melipayamak" | "clerk"
  ) => {
    /* if (provider === "clerk") {
      const phoneNumberResource = user?.phoneNumbers.find(
        (p) => p.phoneNumber === e164Phone.replace("+", "")
      );
      const result = await phoneNumberResource?.attemptVerification({ code });
      if (result?.verification.status !== "verified") {
        throw new Error("Invalid code");
      }
      // بعد از تایید موفق کلرک، به بک‌اند خودمون بگو phone رو توی Mongo ذخیره کنه
      await api.post("/api/users/sync-phone", { phone: e164Phone });
      return;
    } */

    // ایران → مستقیم بک‌اند خودمون
    await api.post("/api/auth/phone/verify-code", { phone: e164Phone, code });
  };

  return { sendCode, verifyCode };
}