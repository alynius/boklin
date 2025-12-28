"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimeRangeInputProps {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  onChange: (start: string, end: string) => void;
  onRemove?: () => void;
  error?: string;
}

// Generate time options in 15-min increments (00:00 to 23:45)
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      times.push(`${h}:${m}`);
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

export function TimeRangeInput({
  startTime,
  endTime,
  onChange,
  onRemove,
  error,
}: TimeRangeInputProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <select
          value={startTime}
          onChange={(e) => onChange(e.target.value, endTime)}
          className={cn(
            "flex-1 px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "transition-smooth font-mono text-sm",
            error && "border-error focus:ring-error"
          )}
          aria-label="Starttid"
        >
          {TIME_OPTIONS.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <span className="text-text-dark/40 font-mono">—</span>

        <select
          value={endTime}
          onChange={(e) => onChange(startTime, e.target.value)}
          className={cn(
            "flex-1 px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "transition-smooth font-mono text-sm",
            error && "border-error focus:ring-error"
          )}
          aria-label="Sluttid"
        >
          {TIME_OPTIONS.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-error hover:bg-error/10"
            aria-label="Ta bort tidsintervall"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
