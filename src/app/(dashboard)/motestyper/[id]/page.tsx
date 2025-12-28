import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getEventTypeById } from "@/lib/db/queries";
import { updateEventTypeAction } from "@/lib/actions";
import { EventTypeForm } from "@/components/forms";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeleteEventTypeButton } from "@/components/dashboard/delete-event-type-button";
import type { EventType } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const eventType = await getEventTypeById(id);

  return {
    title: eventType
      ? `Redigera ${eventType.title} - Boklin`
      : "Redigera mötestyp - Boklin",
    description: "Redigera inställningar för din mötestyp.",
  };
}

export default async function EditEventTypePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  const eventType = await getEventTypeById(id);

  if (!eventType) {
    notFound();
  }

  // Verify ownership
  if (eventType.userId !== session.user.id) {
    redirect("/motestyper");
  }

  const handleUpdate = async (formData: FormData) => {
    "use server";
    const result = await updateEventTypeAction(id, formData);

    if (result.success) {
      redirect("/motestyper");
    }

    return { error: result.error };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/motestyper"
        className="inline-flex items-center gap-2 text-sm text-text-dark/60 hover:text-accent transition-smooth"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka till mötestyper
      </Link>

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
            Redigera mötestyp
          </h1>
          <p className="text-text-dark/60 mt-1">{eventType.title}</p>
        </div>

        <DeleteEventTypeButton eventTypeId={id} />
      </div>

      {/* Form */}
      <EventTypeForm eventType={eventType as EventType} onSubmit={handleUpdate} />
    </div>
  );
}
