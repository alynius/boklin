import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingWidget } from "./booking-widget";
import { getUserByUsername, getEventTypeBySlug } from "@/lib/db/queries";

// Dynamic route - requires database at runtime
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string; eventSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, eventSlug } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return { title: "Användaren hittades inte" };
  }

  const eventType = await getEventTypeBySlug(user.id, eventSlug);

  if (!eventType) {
    return { title: "Mötestypen hittades inte" };
  }

  return {
    title: `${eventType.title} - ${eventType.user.name}`,
    description: eventType.description || `Boka ${eventType.title} med ${eventType.user.name}.`,
  };
}

export default async function EventBookingPage({ params }: Props) {
  const { username, eventSlug } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const eventType = await getEventTypeBySlug(user.id, eventSlug);

  if (!eventType || !eventType.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <BookingWidget eventType={eventType} user={eventType.user} />
    </div>
  );
}
