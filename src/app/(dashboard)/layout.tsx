import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/logga-in");
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-panel-dark text-text-light">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/instrumentpanel"
            className="text-xl font-extrabold tracking-tight"
          >
            Boklin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-light/70">
              {session.user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
              {session.user.name?.[0]?.toUpperCase() || "?"}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <DashboardNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
