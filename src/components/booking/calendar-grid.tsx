"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { sv } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LabelMono } from "@/components/ui/label-mono";

interface CalendarGridProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function CalendarGrid({
  selectedDate,
  onSelectDate,
  availableDates,
  minDate = new Date(),
  maxDate,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  const isDateAvailable = (date: Date) => {
    if (date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    if (!availableDates) return true;
    return availableDates.some((d) => isSameDay(d, date));
  };

  return (
    <div className="bg-panel-light p-6 rounded-lg shadow-panel-calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <LabelMono>Välj datum</LabelMono>
          <h2 className="text-2xl font-bold text-text-dark capitalize mt-1">
            {format(currentMonth, "MMMM yyyy", { locale: sv })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-hover-day rounded-md transition-smooth"
            aria-label="Föregående månad"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-hover-day rounded-md transition-smooth"
            aria-label="Nästa månad"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-mono text-text-dark/50 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const available = isDateAvailable(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => available && isCurrentMonth && onSelectDate(day)}
              disabled={!available || !isCurrentMonth}
              className={cn(
                "aspect-square flex flex-col items-center justify-center font-mono text-sm rounded-sm transition-smooth relative",
                !isCurrentMonth && "opacity-30",
                isCurrentMonth && !available && "opacity-40 cursor-not-allowed",
                isCurrentMonth &&
                  available &&
                  "hover:bg-hover-day hover:-translate-y-0.5",
                isSelected && "bg-accent text-text-light hover:bg-accent"
              )}
            >
              {format(day, "d")}
              {isTodayDate && (
                <span
                  className={cn(
                    "absolute bottom-1 w-1 h-1 rounded-full",
                    isSelected ? "bg-text-light" : "bg-accent"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
