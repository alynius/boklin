import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ label, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="transition-smooth hover:shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="label-mono">{label}</p>
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-error"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span>
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-accent/10 p-3">
              <Icon className="h-6 w-6 text-accent" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
