import { Chip } from "@mui/material";

type Status =
  | "active" | "inactive" | "suspended" | "terminated"
  | "pending" | "approved" | "rejected" | "disbursed"
  | "repaying" | "completed" | "defaulted" | "escalated"
  | "paid" | "overdue" | "partial" | "waived"
  | "frozen" | "closed";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  active:     { label: "Active",      color: "#34D399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
  inactive:   { label: "Inactive",    color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  suspended:  { label: "Suspended",   color: "#FCD34D", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  terminated: { label: "Terminated",  color: "#F87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
  pending:    { label: "Pending",     color: "#FCD34D", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  approved:   { label: "Approved",    color: "#34D399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
  rejected:   { label: "Rejected",    color: "#F87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
  disbursed:  { label: "Disbursed",   color: "#818CF8", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)"  },
  repaying:   { label: "Repaying",    color: "#22D3EE", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)"   },
  completed:  { label: "Completed",   color: "#34D399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
  defaulted:  { label: "Defaulted",   color: "#F87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
  escalated:  { label: "Escalated",   color: "#FB923C", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)"  },
  paid:       { label: "Paid",        color: "#34D399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
  overdue:    { label: "Overdue",     color: "#F87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
  partial:    { label: "Partial",     color: "#FCD34D", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  waived:     { label: "Waived",      color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  frozen:     { label: "Frozen",      color: "#818CF8", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)"  },
  closed:     { label: "Closed",      color: "#475569", bg: "rgba(71,85,105,0.1)",   border: "rgba(71,85,105,0.25)"   },
};

interface StatusChipProps {
  status: Status | string;
  size?: "small" | "medium";
}

export function StatusChip({ status, size = "small" }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.2)",
  };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        height: size === "small" ? 22 : 28,
        fontSize: size === "small" ? "0.6875rem" : "0.8125rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: config.color,
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 1,
        "& .MuiChip-label": {
          px: size === "small" ? 1 : 1.5,
        },
      }}
    />
  );
}
