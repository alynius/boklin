"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui";
import { LabelMono } from "@/components/ui/label-mono";
import { sv } from "@/lib/i18n/sv";

interface BookingsFilterProps {
  currentStatus?: string;
  currentStartDate?: string;
  currentEndDate?: string;
}

export function BookingsFilter({
  currentStatus,
  currentStartDate,
  currentEndDate,
}: BookingsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (
    key: string,
    value: string | null
  ) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/bokningar?${params.toString()}`);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <LabelMono size="sm" className="block mb-2">
            Status
          </LabelMono>
          <select
            value={currentStatus || ""}
            onChange={(e) =>
              handleFilterChange("status", e.target.value || null)
            }
            className="w-full px-3 py-2 bg-panel-light border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth"
          >
            <option value="">Alla statusar</option>
            <option value="pending">{sv.status.pending}</option>
            <option value="confirmed">{sv.status.confirmed}</option>
            <option value="cancelled">{sv.status.cancelled}</option>
            <option value="completed">{sv.status.completed}</option>
          </select>
        </div>

        {/* Start Date Filter */}
        <div className="flex-1 min-w-[200px]">
          <LabelMono size="sm" className="block mb-2">
            Från datum
          </LabelMono>
          <input
            type="date"
            value={currentStartDate || ""}
            onChange={(e) =>
              handleFilterChange("startDate", e.target.value || null)
            }
            className="w-full px-3 py-2 bg-panel-light border border-border-subtle rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth"
          />
        </div>

        {/* End Date Filter */}
        <div className="flex-1 min-w-[200px]">
          <LabelMono size="sm" className="block mb-2">
            Till datum
          </LabelMono>
          <input
            type="date"
            value={currentEndDate || ""}
            onChange={(e) =>
              handleFilterChange("endDate", e.target.value || null)
            }
            className="w-full px-3 py-2 bg-panel-light border border-border-subtle rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth"
          />
        </div>

        {/* Clear Filters Button */}
        {(currentStatus || currentStartDate || currentEndDate) && (
          <div className="flex items-end">
            <button
              onClick={() => router.push("/bokningar")}
              className="px-4 py-2 text-sm text-text-dark/60 hover:text-text-dark transition-smooth"
            >
              Rensa filter
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
