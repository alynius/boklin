"use client";

import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Button, Input } from "@/components/ui";
import { LabelMono } from "@/components/ui/label-mono";
import type { EventType } from "@/types";

interface BookingFormProps {
  eventType: EventType;
  selectedDate: Date;
  selectedTime: Date;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onBack: () => void;
}

interface BookingFormData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export function BookingForm({
  eventType,
  selectedDate,
  selectedTime,
  onSubmit,
  onBack,
}: BookingFormProps) {
  return (
    <div className="bg-panel-light p-8 rounded-lg shadow-card">
      {/* Summary */}
      <div className="mb-8 pb-6 border-b border-border-subtle">
        <LabelMono>Bokningsdetaljer</LabelMono>
        <h2 className="text-xl font-bold text-text-dark mt-2">
          {eventType.title}
        </h2>
        <div className="mt-4 space-y-2 text-sm text-text-dark/70">
          <p>
            <span className="font-medium">Datum:</span>{" "}
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: sv })}
          </p>
          <p>
            <span className="font-medium">Tid:</span>{" "}
            {format(selectedTime, "HH:mm")}
          </p>
          <p>
            <span className="font-medium">Längd:</span> {eventType.duration} minuter
          </p>
          {eventType.price && eventType.price > 0 && (
            <p>
              <span className="font-medium">Pris:</span>{" "}
              {(eventType.price / 100).toFixed(0)} kr
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await onSubmit({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string || undefined,
            notes: formData.get("notes") as string || undefined,
          });
        }}
        className="space-y-4"
      >
        <Input
          label="Namn"
          name="name"
          placeholder="Ditt fullständiga namn"
          required
        />
        <Input
          label="E-post"
          name="email"
          type="email"
          placeholder="din@epost.se"
          required
        />
        <Input
          label="Telefon (valfritt)"
          name="phone"
          type="tel"
          placeholder="+46 70 123 45 67"
        />
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-text-dark mb-1.5"
          >
            Anteckningar (valfritt)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Något du vill dela med mötesvärden?"
            className="w-full px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onBack}>
            Tillbaka
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Bekräfta bokning
          </Button>
        </div>
      </form>
    </div>
  );
}
