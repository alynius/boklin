import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { LabelMono } from "@/components/ui/label-mono";
import { formatDuration } from "@/lib/utils";
import { getUserByUsername, getPublicEventTypes } from "@/lib/db/queries";

// Dynamic route - requires database at runtime
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return { title: "Användaren hittades inte" };
  }

  return {
    title: `Boka tid med ${user.name}`,
    description: `Välj en tid som passar dig för att boka ett möte med ${user.name}.`,
  };
}

export default async function UserBookingPage({ params }: Props) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Fetch active event types for this user
  const eventTypes = await getPublicEventTypes(user.id);

  return (
    <div className="min-h-screen bg-canvas py-12 px-6">
      <div className="mx-auto max-w-2xl">
        {/* User header */}
        <div className="text-center mb-12">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User avatar"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-text-light">
              {user.name?.[0] || "?"}
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
            {user.name}
          </h1>
          <LabelMono className="mt-2 block">Välj en mötestyp</LabelMono>
        </div>

        {/* Event types */}
        {eventTypes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-dark/60">
              Inga bokningsbara möten tillgängliga för tillfället.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventTypes.map((eventType) => (
              <Link
                key={eventType.id}
                href={`/${username}/${eventType.slug}`}
              >
                <Card className="hover:shadow-soft hover:-translate-y-0.5 transition-smooth cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-bold text-text-dark">
                          {eventType.title}
                        </h2>
                        {eventType.description && (
                          <p className="text-sm text-text-dark/60 mt-1">
                            {eventType.description}
                          </p>
                        )}
                      </div>
                      <div className="text-accent font-mono text-sm">
                        {eventType.price && eventType.price > 0
                          ? `${(eventType.price / 100).toFixed(0)} kr`
                          : "Gratis"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-text-dark/60">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDuration(eventType.duration)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {eventType.location?.type === "video"
                          ? "Videomöte"
                          : eventType.location?.type === "phone"
                          ? "Telefon"
                          : eventType.location?.type === "in_person"
                          ? "Fysiskt möte"
                          : "Anpassad"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-text-dark/40 mt-12">
          Drivs av{" "}
          <Link href="/" className="font-medium hover:text-accent">
            Boklin
          </Link>
        </p>
      </div>
    </div>
  );
}
