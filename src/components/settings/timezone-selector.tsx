"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabelMono } from "@/components/ui/label-mono";
import { cn } from "@/lib/utils";

interface TimezoneSelectorProps {
  currentTimezone: string;
  onUpdate: (timezone: string) => Promise<{ success: boolean; error?: string }>;
}

// Common Swedish/European timezones
const TIMEZONES = [
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)" },
  { value: "Europe/Copenhagen", label: "Köpenhamn (CET/CEST)" },
  { value: "Europe/Oslo", label: "Oslo (CET/CEST)" },
  { value: "Europe/Helsinki", label: "Helsingfors (EET/EEST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
  { value: "Europe/Brussels", label: "Bryssel (CET/CEST)" },
  { value: "Europe/Zurich", label: "Zürich (CET/CEST)" },
] as const;

export function TimezoneSelector({
  currentTimezone,
  onUpdate,
}: TimezoneSelectorProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanged = selectedTimezone !== currentTimezone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await onUpdate(selectedTimezone);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Kunde inte uppdatera tidszon");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <LabelMono className="block mb-3">Välj tidszon</LabelMono>
        <select
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className={cn(
            "w-full px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "transition-smooth cursor-pointer"
          )}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-dark/60 mt-2">
          Tidszoner hanteras automatiskt för dina bokningar
        </p>
      </div>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {success && (
        <p className="text-sm text-accent">Tidszon uppdaterad!</p>
      )}

      <Button
        type="submit"
        disabled={!hasChanged || isLoading}
        isLoading={isLoading}
      >
        Spara tidszon
      </Button>
    </form>
  );
}
