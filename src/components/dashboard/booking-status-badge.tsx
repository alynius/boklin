import { cn } from "@/lib/utils";
import { sv } from "@/lib/i18n/sv";
import type { BookingStatus } from "@/types";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: sv.status.pending,
      className: "bg-warning/10 text-warning border-warning/20",
    },
    confirmed: {
      label: sv.status.confirmed,
      className: "bg-success/10 text-success border-success/20",
    },
    cancelled: {
      label: sv.status.cancelled,
      className: "bg-error/10 text-error border-error/20",
    },
    completed: {
      label: sv.status.completed,
      className: "bg-text-dark/10 text-text-dark/60 border-text-dark/10",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-smooth",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
