import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "./empty-state";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import { sv } from "@/lib/i18n/sv";
import { Calendar } from "lucide-react";
import Link from "next/link";

interface UpcomingBookingsProps {
  bookings: Array<{
    id: string;
    guestName: string;
    guestEmail: string;
    eventType: { title: string; duration: number };
    startTime: Date;
  }>;
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{sv.dashboard.upcomingBookings}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title={sv.dashboard.noUpcoming}
            description="Dina kommande möten visas här när de är bokade."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sv.dashboard.upcomingBookings}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bokningar/${booking.id}`}
              className="block rounded-lg border border-border-subtle bg-panel-light p-4 transition-smooth hover:shadow-soft hover:border-accent/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{booking.guestName}</p>
                  <p className="text-sm text-text-dark/60">
                    {booking.guestEmail}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {booking.eventType.title}
                    </span>
                    <span className="text-text-dark/40">·</span>
                    <span className="label-mono">
                      {formatDuration(booking.eventType.duration)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <p className="label-mono">{formatDate(booking.startTime)}</p>
                  <p className="text-lg font-mono font-semibold">
                    {formatTime(booking.startTime)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
