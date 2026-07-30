// Nalo Solutions SMS gateway client.
//
// Nalo Solutions (Ghana) exposes a simple HTTP GET/POST "clientapi" endpoint for
// sending SMS. Configure the following environment variables to enable it:
//
//   NALO_SMS_URL       - Full API endpoint (defaults to the standard clientapi URL)
//   NALO_USERNAME       - Your Nalo account username
//   NALO_PASSWORD       - Your Nalo account password
//   NALO_SENDER_ID      - Approved sender ID / short code shown to recipients
//
// If credentials are not configured, sendSms() will throw so callers can decide
// how to degrade gracefully (e.g. skip OTP requirement, log, etc).

const DEFAULT_NALO_URL = "https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/";

export type SendSmsResult = {
  success: boolean;
  raw?: string;
  error?: string;
};

function normalizeGhanaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  if (digits.length === 9) return `233${digits}`;
  return digits;
}

export function isNaloConfigured(): boolean {
  return Boolean(process.env.NALO_USERNAME && process.env.NALO_PASSWORD && process.env.NALO_SENDER_ID);
}

export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  const username = process.env.NALO_USERNAME;
  const password = process.env.NALO_PASSWORD;
  const source = process.env.NALO_SENDER_ID;
  const apiUrl = process.env.NALO_SMS_URL || DEFAULT_NALO_URL;

  if (!username || !password || !source) {
    return { success: false, error: "Nalo Solutions SMS is not configured. Set NALO_USERNAME, NALO_PASSWORD, and NALO_SENDER_ID." };
  }

  const destination = normalizeGhanaPhone(phone);

  const params = new URLSearchParams({
    username,
    password,
    type: "0",
    destination,
    dlr: "1",
    source,
    message,
  });

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`, { method: "GET" });
    const raw = await response.text();

    if (!response.ok) {
      return { success: false, raw, error: `Nalo SMS request failed with status ${response.status}.` };
    }

    // Nalo's success responses typically start with "1701" (accepted). Anything else is treated
    // as a failure so callers can surface a helpful error instead of assuming delivery.
    if (raw.includes("1701") || raw.toLowerCase().includes("success")) {
      return { success: true, raw };
    }

    return { success: false, raw, error: `Nalo SMS gateway returned an unexpected response: ${raw}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error sending SMS." };
  }
}
