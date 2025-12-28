import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookingsByUserId } from "@/lib/db/queries/bookings";
import { EmptyState } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { LabelMono } from "@/components/ui/label-mono";
import { sv } from "@/lib/i18n/sv";
import { Calendar } from "lucide-react";
import { BookingsFilter } from "./bookings-filter";
import { BookingsTableWrapper } from "./bookings-table-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bokningar | Boklin",
  description: "Hantera dina bokningar",
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  // Await searchParams
  const params = await searchParams;

  // Parse filters from search params
  const filters: {
    status?: "pending" | "confirmed" | "cancelled" | "completed";
    startDate?: Date;
    endDate?: Date;
  } = {};

  if (params.status) {
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (validStatuses.includes(params.status)) {
      filters.status = params.status as "pending" | "confirmed" | "cancelled" | "completed";
    }
  }

  if (params.startDate) {
    const date = new Date(params.startDate);
    if (!isNaN(date.getTime())) {
      filters.startDate = date;
    }
  }

  if (params.endDate) {
    const date = new Date(params.endDate);
    if (!isNaN(date.getTime())) {
      filters.endDate = date;
    }
  }

  // Fetch bookings with filters
  const bookings = await getBookingsByUserId(session.user.id, filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
          {sv.nav.bookings}
        </h1>
        <p className="text-text-dark/60 mt-1">
          Hantera och översikt över alla dina bokningar.
        </p>
      </div>

      {/* Filter Controls */}
      <BookingsFilter
        currentStatus={params.status}
        currentStartDate={params.startDate}
        currentEndDate={params.endDate}
      />

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Alla bokningar</CardTitle>
              <LabelMono size="sm" className="mt-1">
                {bookings.length} {bookings.length === 1 ? "bokning" : "bokningar"}
              </LabelMono>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Inga bokningar hittades"
              description={
                params.status || params.startDate || params.endDate
                  ? "Prova att justera filtren för att se fler bokningar."
                  : "Bokningar från dina kunder visas här."
              }
            />
          ) : (
            <BookingsTableWrapper bookings={bookings} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
