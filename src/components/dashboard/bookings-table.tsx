"use client";

import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "./booking-status-badge";
import { EmptyState } from "./empty-state";
import { formatDate, formatTime } from "@/lib/utils";
import { sv } from "@/lib/i18n/sv";
import type { Booking } from "@/types";
import { Eye, X, Calendar, Check } from "lucide-react";

interface BookingsTableProps {
  bookings: Array<
    Booking & {
      eventType: {
        title: string;
      };
    }
  >;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onView?: (id: string) => void;
}

export function BookingsTable({
  bookings,
  onCancel,
  onConfirm,
  onView,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={sv.dashboard.noUpcoming}
        description="Bokningar från dina kunder visas här."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-panel-light">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border-subtle bg-panel-slots">
            <tr>
              <th className="px-6 py-3 text-left">
                <span className="label-mono">Gäst</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="label-mono">Mötestyp</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="label-mono">Datum & Tid</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="label-mono">Status</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="label-mono">Åtgärder</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="transition-smooth hover:bg-hover-day"
              >
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold">{booking.guestName}</p>
                    <p className="text-sm text-text-dark/60">
                      {booking.guestEmail}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{booking.eventType.title}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formatDate(booking.startTime, { dateStyle: "medium" })}
                    </p>
                    <p className="font-mono text-sm text-text-dark/60">
                      {formatTime(booking.startTime)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(booking.id)}
                        title="Visa bokning"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onConfirm && booking.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onConfirm(booking.id)}
                        title="Bekräfta bokning"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                    )}
                    {onCancel && booking.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(booking.id)}
                        title="Avboka"
                      >
                        <X className="h-4 w-4 text-error" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
