import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById, getGoogleCalendarConnection } from "@/lib/db/queries";
import { updateProfileAction, updateTimezoneAction } from "@/lib/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LabelMono } from "@/components/ui/label-mono";
import { ProfileSettings, TimezoneSelector, IntegrationsSection } from "@/components/settings";
import { User, Settings, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inställningar | Boklin",
  description: "Hantera din profil och kontoinställningar",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  const dbUser = await getUserById(session.user.id);

  if (!dbUser) {
    redirect("/logga-in");
  }

  // Get Google Calendar connection
  const calendarConnection = await getGoogleCalendarConnection(session.user.id);

  // Transform to User type with proper defaults
  const user = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name || "",
    username: dbUser.username || "",
    image: dbUser.image || undefined,
    timezone: dbUser.timezone || "Europe/Stockholm",
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
  };

  // Server action wrapper for profile update
  async function handleProfileUpdate(formData: FormData) {
    "use server";
    const result = await updateProfileAction(formData);
    return {
      success: result.success,
      error: result.success ? undefined : result.error,
    };
  }

  // Server action wrapper for timezone update
  async function handleTimezoneUpdate(timezone: string) {
    "use server";
    const result = await updateTimezoneAction(timezone);
    return {
      success: result.success,
      error: result.success ? undefined : result.error,
    };
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
          Inställningar
        </h1>
        <p className="text-text-dark/60 mt-1">
          Hantera din profil, konto och integrationer
        </p>
      </div>

      {/* Profile Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-accent" />
          <LabelMono>Profil</LabelMono>
        </div>
        <ProfileSettings user={user} onSubmit={handleProfileUpdate} />
      </section>

      {/* Divider */}
      <hr className="border-border-subtle" />

      {/* Account Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-accent" />
          <LabelMono>Konto</LabelMono>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              <CardTitle>Tidszon</CardTitle>
            </div>
            <CardDescription>
              Din tidszon används för att visa bokningar och tillgänglighet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimezoneSelector
              currentTimezone={user.timezone}
              onUpdate={handleTimezoneUpdate}
            />
          </CardContent>
        </Card>
      </section>

      {/* Divider */}
      <hr className="border-border-subtle" />

      {/* Integrations Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-accent" />
          <LabelMono>Integrationer</LabelMono>
        </div>
        <IntegrationsSection
          hasGoogleCalendar={!!calendarConnection}
          calendarEmail={calendarConnection?.email}
        />
      </section>
    </div>
  );
}
