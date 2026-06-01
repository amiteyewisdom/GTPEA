import { SettingsClient } from "@/features/settings/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsClient />;
}
