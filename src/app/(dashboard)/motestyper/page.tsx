import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getEventTypesByUserId } from "@/lib/db/queries";
import { toggleEventTypeActiveAction, deleteEventTypeAction } from "@/lib/actions";
import { Card, CardContent, Button } from "@/components/ui";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EventTypeCard } from "@/components/dashboard/event-type-card";
import type { EventType } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mötestyper - Boklin",
  description: "Hantera dina mötestyper och bokningsinställningar.",
};

export default async function EventTypesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  const eventTypes = await getEventTypesByUserId(session.user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
            Mötestyper
          </h1>
          <p className="text-text-dark/60 mt-1">
            Hantera dina olika typer av möten och deras inställningar
          </p>
        </div>
        <Link href="/motestyper/ny">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Skapa ny mötestyp
          </Button>
        </Link>
      </div>

      {/* Event Types List */}
      {eventTypes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-40 text-text-dark" />
            <h3 className="text-xl font-bold text-text-dark mb-2">
              Inga mötestyper än
            </h3>
            <p className="text-text-dark/60 mb-6 max-w-md mx-auto">
              Skapa din första mötestyp för att låta kunder boka tid med dig.
              Du kan konfigurera längd, pris, plats och mycket mer.
            </p>
            <Link href="/motestyper/ny">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Skapa din första mötestyp
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType as EventType}
              onToggleActive={toggleEventTypeActiveAction}
              onDelete={deleteEventTypeAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
