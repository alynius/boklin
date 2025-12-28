"use server";

import { getAvailableSlots } from "@/lib/availability/slots";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get available time slots for a specific date (public action - no auth required)
 * @param userId - The user's UUID
 * @param eventTypeId - The event type UUID
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Array of available time slots
 */
export async function getAvailableSlotsAction(
  userId: string,
  eventTypeId: string,
  date: string
): Promise<ActionResult<{ time: Date; formatted: string }[]>> {
  try {
    // Parse the date string
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return { success: false, error: "Ogiltigt datum" };
    }

    const slots = await getAvailableSlots(userId, eventTypeId, dateObj);

    return { success: true, data: slots };
  } catch (error) {
    console.error("Failed to get available slots:", error);
    return { success: false, error: "Kunde inte hämta tillgängliga tider" };
  }
}
