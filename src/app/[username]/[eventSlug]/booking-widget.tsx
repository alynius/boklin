"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, CheckCircle } from "lucide-react";
import { CalendarGrid } from "@/components/booking/calendar-grid";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingForm } from "@/components/booking/booking-form";
import { LabelMono } from "@/components/ui/label-mono";
import { Button } from "@/components/ui";
import { formatDuration } from "@/lib/utils";
import { getAvailableSlotsAction } from "@/lib/actions/slots";
import { createBookingAction } from "@/lib/actions/bookings";
import type { EventType, TimeSlot } from "@/types";
import { format } from "date-fns";

interface BookingWidgetProps {
  eventType: EventType & { user: { id: string; name: string; username: string; timezone: string } };
  user: { id: string; name: string; username: string; timezone: string };
}

type Step = "date" | "time" | "details" | "confirmed";

export function BookingWidget({ eventType, user }: BookingWidgetProps) {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setError(null);

      try {
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const result = await getAvailableSlotsAction(
          user.id,
          eventType.id,
          dateString
        );

        if (result.success) {
          // Convert the slots to the format expected by TimeSlotPicker
          const slots: TimeSlot[] = result.data.map((slot) => ({
            time: new Date(slot.time),
            available: true, // All returned slots are available
          }));
          setTimeSlots(slots);
        } else {
          setError(result.error);
          setTimeSlots([]);
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setError("Kunde inte hämta tillgängliga tider");
        setTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, user.id, eventType.id]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setStep("details");
  };

  const handleSubmit = async (data: { name: string; email: string; phone?: string; notes?: string }) => {
    if (!selectedTime) {
      setError("Ingen tid vald");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.notes) formData.append("notes", data.notes);
      formData.append("startTime", selectedTime.toISOString());

      const result = await createBookingAction(eventType.id, formData);

      if (result.success) {
        setStep("confirmed");
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError("Kunde inte skapa bokningen");
      setIsSubmitting(false);
    }
  };

  if (step === "confirmed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-success/10 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-dark mb-3">
            Bokning bekräftad!
          </h1>
          <p className="text-text-dark/60 mb-8">
            Du kommer att få en bekräftelse via e-post med alla detaljer.
          </p>
          <Link href={`/${user.username}`}>
            <Button variant="secondary">Tillbaka till bokningssidan</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${user.username}`}
            className="inline-flex items-center gap-2 text-sm text-text-dark/60 hover:text-text-dark transition-smooth mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-text-light flex-shrink-0">
              {user.name[0]}
            </div>
            <div>
              <LabelMono>{user.name}</LabelMono>
              <h1 className="text-2xl font-extrabold tracking-tight text-text-dark mt-1">
                {eventType.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-text-dark/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDuration(eventType.duration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {eventType.location?.type === "video"
                    ? "Videomöte"
                    : eventType.location?.type === "phone"
                    ? "Telefon"
                    : "Fysiskt möte"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Main content */}
        {step === "date" && (
          <div className="grid md:grid-cols-2 gap-6">
            <CalendarGrid
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
            <div className="hidden md:flex items-center justify-center bg-panel-slots rounded-lg p-8">
              <p className="text-text-dark/60 text-center">
                Välj ett datum för att se tillgängliga tider
              </p>
            </div>
          </div>
        )}

        {step === "time" && selectedDate && (
          <div className="grid md:grid-cols-2 gap-6">
            <CalendarGrid
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
            {isLoadingSlots ? (
              <div className="flex items-center justify-center bg-panel-slots rounded-lg p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-dark/60 text-sm">
                    Laddar tillgängliga tider...
                  </p>
                </div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="flex items-center justify-center bg-panel-slots rounded-lg p-8">
                <p className="text-text-dark/60 text-center">
                  Inga tillgängliga tider detta datum. Försök ett annat datum.
                </p>
              </div>
            ) : (
              <TimeSlotPicker
                date={selectedDate}
                slots={timeSlots}
                selectedTime={selectedTime}
                onSelectTime={handleTimeSelect}
              />
            )}
          </div>
        )}

        {step === "details" && selectedDate && selectedTime && (
          <div className="max-w-xl mx-auto">
            <BookingForm
              eventType={eventType}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSubmit={handleSubmit}
              onBack={() => setStep("time")}
            />
            {isSubmitting && (
              <div className="mt-4 text-center">
                <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-dark/60 text-sm mt-2">
                  Skapar bokning...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
