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
        device_model: deviceInfo.deviceModel,
        location_country: location.country,
        location_city: location.city,
        location_region: location.region,
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
  let deviceModel = "";

  // Device type and model
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device = "Mobile";
    // Try to detect specific mobile devices
    if (/iphone/i.test(ua)) {
      deviceModel = "iPhone";
      const match = ua.match(/iphone os ([\d_]+)/);
      if (match) deviceModel += ` ${match[1].replace(/_/g, '.')}`;
    } else if (/ipad/i.test(ua)) {
      deviceModel = "iPad";
    } else if (/android/i.test(ua)) {
      const match = ua.match(/android ([\d.]+)/);
      deviceModel = `Android ${match ? match[1] : ''}`;
    }
  } else if (/tablet|ipad/i.test(ua)) {
    device = "Tablet";
    deviceModel = "iPad";
  }

  // Browser with version
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) {
    const match = ua.match(/chrome\/([\d.]+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    const match = ua.match(/version\/([\d.]+)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  } else if (/firefox/i.test(ua)) {
    const match = ua.match(/firefox\/([\d.]+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (/edge/i.test(ua)) {
    const match = ua.match(/edge\/([\d.]+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  } else if (/opr/i.test(ua)) {
    const match = ua.match(/opr\/([\d.]+)/);
    browser = match ? `Opera ${match[1]}` : "Opera";
  }

  // OS with version
  if (/windows/i.test(ua)) {
    if (/windows nt 10.0/i.test(ua)) {
      os = "Windows 10/11";
    } else if (/windows nt 6.3/i.test(ua)) {
      os = "Windows 8.1";
    } else if (/windows nt 6.2/i.test(ua)) {
      os = "Windows 8";
    } else if (/windows nt 6.1/i.test(ua)) {
      os = "Windows 7";
    } else {
      os = "Windows";
    }
  } else if (/mac|macintosh|mac os x/i.test(ua)) {
    const match = ua.match(/mac os x ([\d_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  } else if (/android/i.test(ua)) {
    const match = ua.match(/android ([\d.]+)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/iphone|ipad|ios/i.test(ua)) {
    const match = ua.match(/os ([\d_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : "iOS";
  }

  return { device, browser, os, deviceModel };
}

async function getLocationFromIP(ip: string) {
  // Country code to name mapping
  const countryNames: Record<string, string> = {
    'GH': 'Ghana',
    'US': 'United States',
    'GB': 'United Kingdom',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'ZA': 'South Africa',
    // Add more as needed
  };

  // Try ipinfo.io first (more reliable, not rate-limited)
  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await response.json();
    const countryCode = data.country || "";
    const countryName = countryNames[countryCode] || countryCode || "Unknown";
    return {
      country: countryName,
      city: data.city || "Unknown",
      region: data.region || "",
    };
  } catch {
    // Fallback to ipapi.co
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return {
        country: data.country_name || data.country || "Unknown",
        city: data.city || "Unknown",
        region: data.region || "",
      };
    } catch {
      return { country: "Unknown", city: "Unknown", region: "" };
    }
  }
}
