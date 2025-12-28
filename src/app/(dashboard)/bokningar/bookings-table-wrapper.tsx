"use client";

import { BookingsTable } from "@/components/dashboard";
import { cancelBookingAction, confirmBookingAction } from "@/lib/actions";
import type { Booking } from "@/types";
import { useRouter } from "next/navigation";

interface BookingsTableWrapperProps {
  bookings: Array<
    Booking & {
      eventType: {
        title: string;
      };
    }
  >;
}

export function BookingsTableWrapper({ bookings }: BookingsTableWrapperProps) {
  const router = useRouter();

  const handleCancel = async (id: string) => {
    if (!confirm("Är du säker på att du vill avboka denna bokning?")) {
      return;
    }

    try {
      const result = await cancelBookingAction(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Kunde inte avboka bokningen");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Ett fel uppstod. Försök igen.");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const result = await confirmBookingAction(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Kunde inte bekräfta bokningen");
      }
    } catch (error) {
      console.error("Failed to confirm booking:", error);
      alert("Ett fel uppstod. Försök igen.");
    }
  };

  return (
    <BookingsTable
      bookings={bookings}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
}
