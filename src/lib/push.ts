import { createAdminClient } from "@/lib/supabase/admin";
import webpush from "web-push";

let webpushInitialized = false;

function initWebpush() {
  if (webpushInitialized) return;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@gtpea.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  webpushInitialized = true;
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url?: string
) {
  try {
    initWebpush();
    const admin = createAdminClient();
    const { data: subs } = await (admin as any)
      .from("push_subscriptions")
      .select("endpoint, keys")
      .eq("user_id", userId);

    if (!subs?.length) return;

    const payload = JSON.stringify({ title, body, url });
    await Promise.allSettled(
      subs.map((sub: any) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        )
      )
    );
  } catch (err) {
    console.warn("sendPushNotification failed:", err);
  }
}
