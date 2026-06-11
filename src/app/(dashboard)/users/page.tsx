import { UsersClient } from "@/features/pages/UsersClient";
import { fetchUsersData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const { users } = await fetchUsersData();
  return <UsersClient users={users} />;
}
