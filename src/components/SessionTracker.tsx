"use client";

import { useEffect } from "react";

export default function SessionTracker() {
  useEffect(() => {
    const track = async (position?: GeolocationPosition) => {
      const payload: Record<string, any> = {
        user_agent: navigator.userAgent,
        ip_address: "",
      };
      if (position) {
        payload.latitude = position.coords.latitude;
        payload.longitude = position.coords.longitude;
        payload.accuracy = position.coords.accuracy;
      }
      try {
        await fetch("/api/sessions/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("Session tracking failed:", err);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => track(pos),
        () => track(),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      track();
    }
  }, []);

  return null;
}
