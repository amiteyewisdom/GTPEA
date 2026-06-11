"use client";

import { useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Search, Users } from "lucide-react";

export function UsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.employeeId.toLowerCase().includes(query)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Users Management</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Manage system users and their roles
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-brand-card-border bg-white py-2 pl-10 pr-4 text-brand-text outline-none focus:border-brand-accent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["User", "Employee ID", "Role", "Status", "Joined"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-sm font-medium text-brand-text-secondary">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-text-secondary">
                    <Users className="mx-auto mb-3 h-12 w-12 text-brand-text-secondary/50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-brand-card-border">
                    <td className="px-4 py-3 text-sm font-medium text-brand-text">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.employeeId}</td>
                    <td className="px-4 py-3 text-sm capitalize text-brand-text-secondary">{user.role.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.status}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.joined}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
