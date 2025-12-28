"use client";

import { useState } from "react";
import { Availability, DAY_NAMES_SV, DayOfWeek } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LabelMono } from "@/components/ui/label-mono";
import { TimeRangeInput } from "./time-range-input";
import { cn } from "@/lib/utils";

interface AvailabilityInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

interface AvailabilityEditorProps {
  availability: Availability[];
  onSave: (slots: AvailabilityInput[]) => Promise<{ error?: string }>;
  isLoading?: boolean;
}

interface DaySlots {
  enabled: boolean;
  ranges: Array<{ start: string; end: string }>;
}

type WeekSchedule = Record<DayOfWeek, DaySlots>;

export function AvailabilityEditor({
  availability,
  onSave,
  isLoading = false,
}: AvailabilityEditorProps) {
  // Convert availability array to day-grouped structure
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    const initial: WeekSchedule = {
      0: { enabled: false, ranges: [] },
      1: { enabled: false, ranges: [] },
      2: { enabled: false, ranges: [] },
      3: { enabled: false, ranges: [] },
      4: { enabled: false, ranges: [] },
      5: { enabled: false, ranges: [] },
      6: { enabled: false, ranges: [] },
    };

    availability.forEach((slot) => {
      const day = slot.dayOfWeek as DayOfWeek;
      if (!initial[day].enabled) {
        initial[day] = { enabled: true, ranges: [] };
      }
      initial[day].ranges.push({
        start: slot.startTime,
        end: slot.endTime,
      });
    });

    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleDay = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        enabled: !prev[day].enabled,
        ranges: prev[day].enabled ? [] : [{ start: "09:00", end: "17:00" }],
      },
    }));
  };

  const addTimeRange = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: [...prev[day].ranges, { start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeTimeRange = (day: DayOfWeek, index: number) => {
    setSchedule((prev) => {
      const newRanges = prev[day].ranges.filter((_, i) => i !== index);
      return {
        ...prev,
        [day]: {
          enabled: newRanges.length > 0,
          ranges: newRanges,
        },
      };
    });
  };

  const updateTimeRange = (
    day: DayOfWeek,
    index: number,
    start: string,
    end: string
  ) => {
    setSchedule((prev) => {
      const newRanges = [...prev[day].ranges];
      newRanges[index] = { start, end };
      return {
        ...prev,
        [day]: {
          ...prev[day],
          ranges: newRanges,
        },
      };
    });
  };

  const validateSchedule = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(schedule).forEach(([dayStr, daySlots]) => {
      const day = Number(dayStr) as DayOfWeek;
      if (!daySlots.enabled) return;

      daySlots.ranges.forEach((range, index) => {
        if (range.start >= range.end) {
          newErrors[`${day}-${index}`] = "Sluttid måste vara efter starttid";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateSchedule()) return;

    const slots: AvailabilityInput[] = [];
    Object.entries(schedule).forEach(([dayStr, daySlots]) => {
      const day = Number(dayStr) as DayOfWeek;
      if (daySlots.enabled) {
        daySlots.ranges.forEach((range) => {
          slots.push({
            dayOfWeek: day,
            startTime: range.start,
            endTime: range.end,
          });
        });
      }
    });

    const result = await onSave(slots);
    if (result.error) {
      setErrors({ general: result.error });
    }
  };

  // Days in order Monday-Sunday
  const weekDays: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tillgänglighet</CardTitle>
        <LabelMono className="block mt-2">Veckoschema</LabelMono>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {weekDays.map((day) => {
            const daySlots = schedule[day];
            return (
              <div key={day} className="pb-6 border-b border-border-subtle last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={daySlots.enabled}
                        onChange={() => toggleDay(day)}
                        className={cn(
                          "w-5 h-5 rounded border-border-subtle text-accent",
                          "focus:ring-2 focus:ring-accent focus:ring-offset-2",
                          "transition-smooth cursor-pointer"
                        )}
                      />
                      <span className="font-semibold text-text-dark">
                        {DAY_NAMES_SV[day]}
                      </span>
                    </label>
                    {!daySlots.enabled && (
                      <LabelMono size="sm" className="text-text-dark/40">
                        Otillgänglig
                      </LabelMono>
                    )}
                  </div>

                  {daySlots.enabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addTimeRange(day)}
                      className="text-accent"
                    >
                      + Lägg till tid
                    </Button>
                  )}
                </div>

                {daySlots.enabled && (
                  <div className="space-y-2 ml-7">
                    {daySlots.ranges.map((range, index) => (
                      <TimeRangeInput
                        key={index}
                        startTime={range.start}
                        endTime={range.end}
                        onChange={(start, end) =>
                          updateTimeRange(day, index, start, end)
                        }
                        onRemove={
                          daySlots.ranges.length > 1
                            ? () => removeTimeRange(day, index)
                            : undefined
                        }
                        error={errors[`${day}-${index}`]}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {errors.general && (
          <p className="mt-4 text-sm text-error">{errors.general}</p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Spara tillgänglighet
        </Button>
      </CardFooter>
    </Card>
  );
}
