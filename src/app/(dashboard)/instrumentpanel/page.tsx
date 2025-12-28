import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserStats, getUpcomingBookingsWithEventType, getEventTypesByUserId, getUserById } from "@/lib/db/queries";
import { StatsCard, UpcomingBookings, EmptyState, CopyLinkButton } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { sv } from "@/lib/i18n/sv";
import { Calendar, Users, TrendingUp, Link as LinkIcon, CalendarPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Instrumentpanel",
  description: "Hantera dina bokningar och inställningar.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  // Fetch all data in parallel
  const [stats, upcoming, eventTypes, user] = await Promise.all([
    getUserStats(session.user.id),
    getUpcomingBookingsWithEventType(session.user.id, 5),
    getEventTypesByUserId(session.user.id),
    getUserById(session.user.id),
  ]);

  const userName = session.user.name?.split(" ")[0] || "där";
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se"}/${user?.username || ""}`;

  // Show empty state if user has no event types
  const hasNoEventTypes = eventTypes.length === 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
          {sv.dashboard.welcome}, {userName}!
        </h1>
        <p className="text-text-dark/60 mt-1">
          Här är en översikt av dina bokningar och aktivitet.
        </p>
      </div>

      {/* Empty state for new users with no event types */}
      {hasNoEventTypes ? (
        <EmptyState
          icon={CalendarPlus}
          title="Skapa din första mötestyp"
          description="För att börja ta emot bokningar behöver du först skapa en mötestyp som definierar längd, pris och plats för dina möten."
          action={{
            label: "Skapa mötestyp",
            href: "/motestyper",
          }}
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              label={sv.dashboard.todayBookings}
              value={stats.today}
              icon={Calendar}
            />
            <StatsCard
              label={sv.dashboard.thisWeek}
              value={stats.thisWeek}
              icon={TrendingUp}
            />
            <StatsCard
              label={sv.dashboard.thisMonth}
              value={stats.thisMonth}
              icon={Users}
            />
            <StatsCard
              label={sv.dashboard.totalBookings}
              value={stats.total}
              icon={Calendar}
            />
          </div>

          {/* Booking Link */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg">{sv.dashboard.shareLink}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <code className="flex-1 bg-panel-slots px-4 py-3 rounded-md font-mono text-sm">
                  {bookingUrl}
                </code>
                <CopyLinkButton url={bookingUrl} />
              </div>
              <p className="text-sm text-text-dark/60 mt-3">
                Dela denna länk med dina kunder så att de enkelt kan boka tid med dig.
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <UpcomingBookings bookings={upcoming} />
        </>
      )}
    </div>
  );
}
