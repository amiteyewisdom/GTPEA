"use client";

import { ImpersonationProvider } from "./ImpersonationProvider";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return <ImpersonationProvider>{children}</ImpersonationProvider>;
}
