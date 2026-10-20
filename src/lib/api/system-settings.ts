import type { SupabaseClient } from "@supabase/supabase-js";

export type SystemFlag = "logins_locked" | "maintenance_mode";

// Reads a system_settings flag. Returns false when the table/row is missing
// so the app still works before the migration is applied.
export async function getSystemFlag(
  client: SupabaseClient,
  key: SystemFlag
): Promise<boolean> {
  const { data, error } = await (client
    .from("system_settings") as any)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) return false;
  return data?.value === true;
}

export async function getSystemFlags(client: SupabaseClient) {
  const { data, error } = await (client
    .from("system_settings") as any)
    .select("key, value");

  const flags: Record<SystemFlag, boolean> = {
    logins_locked: false,
    maintenance_mode: false,
  };
  if (error) return flags;

  for (const row of data ?? []) {
    if (row.key in flags) flags[row.key as SystemFlag] = row.value === true;
  }
  return flags;
}
