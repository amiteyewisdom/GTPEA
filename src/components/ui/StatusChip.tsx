type Status =
  | "active" | "inactive" | "suspended" | "terminated"
  | "pending" | "approved" | "rejected" | "disbursed"
  | "repaying" | "completed" | "defaulted" | "escalated"
  | "paid" | "overdue" | "partial" | "waived"
  | "frozen" | "closed";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active:     { label: "Active",     cls: "bg-green-100 text-green-700 ring-green-200"   },
  inactive:   { label: "Inactive",   cls: "bg-gray-100 text-gray-500 ring-gray-200"      },
  suspended:  { label: "Suspended",  cls: "bg-amber-100 text-amber-700 ring-amber-200"   },
  terminated: { label: "Terminated", cls: "bg-red-100 text-red-600 ring-red-200"         },
  pending:    { label: "Pending",    cls: "bg-amber-100 text-amber-700 ring-amber-200"   },
  approved:   { label: "Approved",   cls: "bg-green-100 text-green-700 ring-green-200"   },
  rejected:   { label: "Rejected",   cls: "bg-red-100 text-red-600 ring-red-200"         },
  disbursed:  { label: "Disbursed",  cls: "bg-indigo-100 text-indigo-600 ring-indigo-200"},
  repaying:   { label: "Repaying",   cls: "bg-cyan-100 text-cyan-700 ring-cyan-200"      },
  completed:  { label: "Completed",  cls: "bg-green-100 text-green-700 ring-green-200"   },
  defaulted:  { label: "Defaulted",  cls: "bg-red-100 text-red-600 ring-red-200"         },
  escalated:  { label: "Escalated",  cls: "bg-orange-100 text-orange-600 ring-orange-200"},
  paid:       { label: "Paid",       cls: "bg-green-100 text-green-700 ring-green-200"   },
  overdue:    { label: "Overdue",    cls: "bg-red-100 text-red-600 ring-red-200"         },
  partial:    { label: "Partial",    cls: "bg-amber-100 text-amber-700 ring-amber-200"   },
  waived:     { label: "Waived",     cls: "bg-gray-100 text-gray-500 ring-gray-200"      },
  frozen:     { label: "Frozen",     cls: "bg-indigo-100 text-indigo-600 ring-indigo-200"},
  closed:     { label: "Closed",     cls: "bg-slate-100 text-slate-500 ring-slate-200"   },
};

interface StatusChipProps {
  status: Status | string;
  size?: "small" | "medium";
}

export function StatusChip({ status, size = "small" }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    cls: "bg-gray-100 text-gray-500 ring-gray-200",
  };

  return (
    <span className={`inline-flex items-center rounded-md font-semibold ring-1 ring-inset ${config.cls} ${
      size === "small" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-xs"
    }`}>
      {config.label}
    </span>
  );
}
