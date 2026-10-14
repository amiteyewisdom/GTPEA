import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "./push";

export async function notifyUser(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string | null
) {
  const admin = createAdminClient();
  const { error } = await (admin as any).from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    related_id: relatedId,
    is_read: false,
  });

  if (error) {
    console.warn("Notification insert failed:", error.message);
    return;
  }

  // Fire-and-forget push notification
  await sendPushNotification(userId, title, message, relatedId ? `/notifications` : "/dashboard");
}
