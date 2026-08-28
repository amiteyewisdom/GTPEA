import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user_agent, ip_address } = body;

    // Parse user agent to get device info
    const deviceInfo = parseUserAgent(user_agent);

    // Get location from IP (simplified - in production use a proper geolocation service)
    const location = await getLocationFromIP(ip_address);

    // Mark all other sessions as not current
    await (supabase as any)
      .from("user_sessions")
      .update({ is_current: false })
      .eq("user_id", user.id)
      .eq("is_current", true);

    // Create new session
    const { data: session, error } = await (supabase as any)
      .from("user_sessions")
      .insert({
        user_id: user.id,
        session_token: crypto.randomUUID(),
        user_agent,
        ip_address,
        device_type: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        location_country: location.country,
        location_city: location.city,
        is_current: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  let device = "Desktop";
  let browser = "Unknown";
  let os = "Unknown";

  // Device type
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device = "Mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    device = "Tablet";
  }

  // Browser
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox/i.test(ua)) {
    browser = "Firefox";
  } else if (/edge/i.test(ua)) {
    browser = "Edge";
  } else if (/opr/i.test(ua)) {
    browser = "Opera";
  }

  // OS
  if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/mac|macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/iphone|ipad|ios/i.test(ua)) {
    os = "iOS";
  }

  return { device, browser, os };
}

async function getLocationFromIP(ip: string) {
  // Try multiple geolocation services for better reliability
  const services = [
    async () => {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return {
        country: data.country_name || data.country || "Unknown",
        city: data.city || "Unknown",
      };
    },
    async () => {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      const data = await response.json();
      return {
        country: data.country || "Unknown",
        city: data.city || "Unknown",
      };
    },
  ];

  for (const service of services) {
    try {
      const result = await service();
      if (result.country !== "Unknown" || result.city !== "Unknown") {
        return result;
      }
    } catch {
      continue;
    }
  }

  return { country: "Unknown", city: "Unknown" };
}
