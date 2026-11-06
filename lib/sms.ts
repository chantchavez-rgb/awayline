import "server-only";

export function smsReady(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

export async function sendLoginCode(phone: string, code: string): Promise<{ error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { error: "Texting isn't set up on this server yet." };

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your Awayline code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!res.ok) {
    console.error("Twilio send failed", res.status);
    return { error: "Couldn't send the text. Check the number and try again." };
  }
  return {};
}
