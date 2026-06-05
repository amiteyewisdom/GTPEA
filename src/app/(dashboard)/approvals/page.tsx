import { createClient } from "@/lib/supabase/server";
import { ApprovalsClient } from "@/features/approvals/ApprovalsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const supabase = await createClient();

  const { data: approvals, count } = await supabase
    .from("approvals")
    .select(
      `*, profiles!approvals_submitted_by_fkey (full_name), approval_actions (stage, required_role, action, notes, actioned_at)`,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false });

  return <ApprovalsClient approvals={approvals ?? []} total={count ?? 0} />;
}
