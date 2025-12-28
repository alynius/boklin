import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAvailabilityByUserId } from "@/lib/db/queries/availability";
import { getUserById } from "@/lib/db/queries/users";
import { AvailabilityPageClient } from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tillgänglighet | Boklin",
  description: "Ställ in dina arbetstider för bokningar",
};

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/logga-in");
  }

  const [availability, user] = await Promise.all([
    getAvailabilityByUserId(session.user.id),
    getUserById(session.user.id),
  ]);

  const timezone = user?.timezone || "Europe/Stockholm";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-dark">
          Tillgänglighet
        </h1>
        <p className="text-text-dark/60 mt-1">
          Ställ in dina arbetstider så att kunder kan boka tid när du är ledig.
        </p>
      </div>

      {/* Timezone Info */}
      <div className="bg-panel-slots border border-border-subtle rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-text-dark">
              Tidszon: <span className="font-mono">{timezone}</span>
            </p>
            <p className="text-xs text-text-dark/60 mt-0.5">
              Alla tider visas i din lokala tidszon
            </p>
          </div>
        </div>
      </div>

      {/* Availability Editor */}
      <AvailabilityPageClient availability={availability} />

      {/* Help Text */}
      <div className="bg-panel-light border border-border-subtle rounded-lg p-6">
        <h3 className="font-semibold text-text-dark mb-2">
          Så fungerar tillgänglighet
        </h3>
        <ul className="space-y-2 text-sm text-text-dark/70">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              Välj vilka dagar du vill vara tillgänglig för bokningar genom att
              markera kryssrutan.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              Du kan lägga till flera tidsperioder per dag om du till exempel
              vill ha lunch- eller kafferast.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              Dina arbetstider gäller för alla dina mötestyper. Du kan justera
              buffert och framförhållning per mötestyp.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              Glöm inte att spara dina ändringar när du är klar!
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
