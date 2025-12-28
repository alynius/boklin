"use client";

import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { LabelMono } from "@/components/ui/label-mono";
import type { TimeSlot } from "@/types";

interface TimeSlotPickerProps {
  date: Date;
  slots: TimeSlot[];
  selectedTime: Date | null;
  onSelectTime: (time: Date) => void;
}

export function TimeSlotPicker({
  date,
  slots,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className="bg-panel-slots p-6 rounded-lg shadow-panel-slots">
      <div className="mb-6">
        <LabelMono>Tillgängliga tider</LabelMono>
        <h2 className="text-lg font-bold text-text-dark mt-1 capitalize">
          {format(date, "EEEE d MMMM", { locale: sv })}
        </h2>
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-center py-8 text-text-dark/60">
          <p className="font-medium">Inga tider tillgängliga</p>
          <p className="text-sm mt-1">Välj ett annat datum</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {availableSlots.map((slot) => {
            const isSelected =
              selectedTime && slot.time.getTime() === selectedTime.getTime();

            return (
              <button
                key={slot.time.toISOString()}
                onClick={() => onSelectTime(slot.time)}
                className={cn(
                  "w-full py-3 px-4 rounded-md font-mono text-sm text-center border transition-smooth",
                  isSelected
                    ? "bg-slot-bg-hover border-accent"
                    : "bg-slot-bg border-border-subtle hover:bg-slot-bg-hover hover:border-accent hover:scale-105"
                )}
              >
                {format(slot.time, "HH:mm")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
