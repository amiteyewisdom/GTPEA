"use client";

import { useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Search } from "lucide-react";

type SearchableListProps = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  emptyMessage: string;
  items: { id: string; searchText: string; content: React.ReactNode }[];
  stats?: React.ReactNode;
  actions?: React.ReactNode;
};

export default function SearchableList({
  title,
  subtitle,
  searchPlaceholder,
  emptyMessage,
  items,
  stats,
  actions,
}: SearchableListProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.searchText.toLowerCase().includes(query));
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">{title}</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">{subtitle}</p>
      </div>

      {stats}

      <GlassCard className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-brand-card-border bg-white py-2 pl-10 pr-4 text-brand-text outline-none focus:border-brand-accent"
            />
          </div>
          {actions}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-text-secondary">{emptyMessage}</p>
          ) : (
            filtered.map((item) => <div key={item.id}>{item.content}</div>)
          )}
        </div>
      </GlassCard>
    </div>
  );
}
