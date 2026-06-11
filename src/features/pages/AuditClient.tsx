"use client";

import SearchableList from "@/components/data/SearchableList";
import { Activity, Clock } from "lucide-react";

export function AuditClient({ logs }: { logs: any[] }) {
  return (
    <SearchableList
      title="Audit Logs"
      subtitle="Track system activities and changes"
      searchPlaceholder="Search logs..."
      emptyMessage="No audit logs recorded yet."
      items={logs.map((log) => ({
        id: log.id,
        searchText: `${log.action} ${log.tableName} ${log.performer} ${log.details}`,
        content: (
          <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
            <Activity className="h-5 w-5 text-brand-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-text">{log.action}</p>
              <p className="text-xs text-brand-text-secondary">
                {log.details} · {log.performer}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
              <Clock className="h-4 w-4" />
              {log.time}
            </div>
          </div>
        ),
      }))}
    />
  );
}
