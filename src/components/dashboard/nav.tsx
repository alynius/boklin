"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CalendarClock,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/instrumentpanel",
    label: "Instrumentpanel",
    icon: LayoutDashboard,
  },
  {
    href: "/bokningar",
    label: "Bokningar",
    icon: Calendar,
  },
  {
    href: "/tillganglighet",
    label: "Tillgänglighet",
    icon: Clock,
  },
  {
    href: "/motestyper",
    label: "Mötestyper",
    icon: CalendarClock,
  },
  {
    href: "/installningar",
    label: "Inställningar",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth",
              isActive
                ? "bg-accent text-text-light"
                : "text-text-dark/70 hover:bg-hover-day hover:text-text-dark"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-dark/70 hover:bg-hover-day hover:text-text-dark transition-smooth w-full mt-4"
      >
        <LogOut className="w-5 h-5" />
        Logga ut
      </button>
    </nav>
  );
}
