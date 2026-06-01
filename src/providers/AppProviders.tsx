"use client";

import { ThemeRegistry } from "./ThemeRegistry";
import { SupabaseProvider } from "./SupabaseProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <SupabaseProvider>{children}</SupabaseProvider>
    </ThemeRegistry>
  );
}
