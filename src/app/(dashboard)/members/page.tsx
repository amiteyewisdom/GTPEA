import { MembersClient } from "@/features/pages/MembersClient";
import { fetchMembersData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { members } = await fetchMembersData();
  return <MembersClient members={members} />;
}
