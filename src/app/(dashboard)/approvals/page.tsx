import { createClient } from "@/lib/supabase/server";
import { fetchApprovalsList } from "@/lib/approvals/fetch-approvals";
import { ApprovalsClient } from "@/features/approvals/ApprovalsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRes = user
    ? await supabase.from("profiles").select("role").eq("user_id", user.id).single()
    : { data: null };

  const userRole = (profileRes.data as { role: string } | null)?.role ?? "employee";
  const { approvals, total } = await fetchApprovalsList();

  return (
    <ApprovalsClient
      approvals={approvals}
      total={total}
      userRole={userRole}
      userId={user?.id ?? ""}
    />
  );
}
