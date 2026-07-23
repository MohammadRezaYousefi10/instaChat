// services/melipayamak.ts
// مستندات: https://www.melipayamak.com  -- مقادیر رو با اکانت خودت پر کن
const USERNAME = process.env.MELIPAYAMAK_USERNAME!;
const PASSWORD = process.env.MELIPAYAMAK_PASSWORD!;
const BODY_ID = process.env.MELIPAYAMAK_BODY_ID!; // آیدی قالب پیامک تاییدشده

export async function sendMelipayamakOtp(phone: string, code: string) {
  // شماره بدون + برای ملی‌پیامک لازمه (مثلا 09123456789)
  const localFormat = phone.replace("+98", "0");

  const res = await fetch("https://console.melipayamak.com/api/send/shared/" + BODY_ID, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
      to: localFormat,
      args: [code], // مقدار جایگزین {0} در قالب پیامک
    }),
  });

  if (!res.ok) {
    throw new Error("Melipayamak send failed");
  }
}