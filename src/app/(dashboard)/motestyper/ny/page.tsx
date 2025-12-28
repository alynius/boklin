import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { createEventTypeAction } from "@/lib/actions";
import { EventTypeForm } from "@/components/forms";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skapa ny mötestyp - Boklin",
  description: "Skapa en ny mötestyp för dina kunder att boka.",
};

export default async function NewEventTypePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  const handleCreate = async (formData: FormData) => {
    "use server";
    const result = await createEventTypeAction(formData);

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
          Skapa ny mötestyp
        </h1>
        <p className="text-text-dark/60 mt-1">
          Konfigurera inställningar för en ny typ av bokning
        </p>
      </div>

      {/* Form */}
      <EventTypeForm onSubmit={handleCreate} />
    </div>
  );
}
