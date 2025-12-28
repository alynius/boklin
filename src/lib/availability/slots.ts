import {
  addMinutes,
  subMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  addHours,
  format,
  setHours,
  setMinutes,
  getDay,
} from "date-fns";
import { db } from "@/lib/db";
import { availability, bookings, eventTypes } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import type { DayOfWeek } from "@/types";
import { getValidAccessToken } from "@/lib/db/queries/calendar";
import { getCalendarBusyTimes } from "@/lib/calendar/google";

export interface TimeSlot {
  time: Date;
  formatted: string; // "14:30"
}

/**
 * Get available time slots for a user's event type on a specific date
 * @param userId - The user's UUID
 * @param eventTypeId - The event type UUID
 * @param date - The date to check availability for
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  userId: string,
  eventTypeId: string,
  date: Date
): Promise<TimeSlot[]> {
  // 1. Get user's availability for this day of week (0=Sunday, 6=Saturday)
  const dayOfWeek = getDay(date) as DayOfWeek;

  const userAvailability = await db
    .select()
    .from(availability)
    .where(
      and(eq(availability.userId, userId), eq(availability.dayOfWeek, dayOfWeek))
    );

  if (userAvailability.length === 0) {
    return []; // No availability set for this day
  }

  // 2. Get event type details (duration, bufferBefore, bufferAfter, minNotice)
  const [eventType] = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.id, eventTypeId));

  if (!eventType) {
    throw new Error("Event type not found");
  }

  // 3. Get existing bookings for this date
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, dayStart),
        lte(bookings.startTime, dayEnd),
        // Only consider confirmed and pending bookings
        eq(bookings.status, "confirmed")
      )
    );

  // Also get pending bookings
  const pendingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, dayStart),
        lte(bookings.startTime, dayEnd),
        eq(bookings.status, "pending")
      )
    );

  const allBlockingBookings = [...existingBookings, ...pendingBookings];

  // 3.5. Get busy times from Google Calendar if connected
  const calendarBusyTimes: Array<{ start: Date; end: Date }> = [];
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (accessToken) {
      const busyTimes = await getCalendarBusyTimes(
        accessToken,
        dayStart,
        dayEnd
      );
      calendarBusyTimes.push(...busyTimes);
    }
  } catch (error) {
    console.error("Failed to fetch calendar busy times:", error);
    // Continue without calendar data - don't block the booking flow
  }

  // 4. Generate all possible slots from availability windows
  const allSlots: TimeSlot[] = [];

  for (const slot of userAvailability) {
    const slotsFromRange = generateTimeSlotsFromRange(
      slot.startTime,
      slot.endTime,
      date,
      eventType.duration,
      15 // 15-minute increments
    );
    allSlots.push(...slotsFromRange);
  }

  // 5. Filter out slots that don't meet requirements
  const now = new Date();
  const minNoticeDate = addHours(now, eventType.minNotice);

  const availableSlots = allSlots.filter((slot) => {
    // Check minimum notice period
    if (isBefore(slot.time, minNoticeDate)) {
      return false;
    }

    // Calculate the full time range including buffers
    const slotStart = subMinutes(slot.time, eventType.bufferBefore);
    const slotEnd = addMinutes(
      addMinutes(slot.time, eventType.duration),
      eventType.bufferAfter
    );

    // Check for conflicts with existing bookings
    for (const booking of allBlockingBookings) {
      // For each booking, we need to consider its buffers as well
      // Since bookings are stored without buffers, we add them here
      const bookingStart = subMinutes(
        new Date(booking.startTime),
        eventType.bufferBefore
      );
      const bookingEnd = addMinutes(
        new Date(booking.endTime),
        eventType.bufferAfter
      );

      if (
        isOverlapping(
          { start: slotStart, end: slotEnd },
          { start: bookingStart, end: bookingEnd }
        )
      ) {
        return false;
      }
    }

    // Check for conflicts with Google Calendar busy times
    for (const busyTime of calendarBusyTimes) {
      if (
        isOverlapping(
          { start: slotStart, end: slotEnd },
          { start: busyTime.start, end: busyTime.end }
        )
      ) {
        return false;
      }
    }

    return true;
  });

  return availableSlots;
}

/**
 * Generate time slots from a time range
 * @param startTime - Start time in HH:mm format (e.g., "09:00")
 * @param endTime - End time in HH:mm format (e.g., "17:00")
 * @param date - The date to apply these times to
 * @param duration - Duration of each slot in minutes
 * @param increment - Increment between slots in minutes (default: 15)
 * @returns Array of time slots
 */
function generateTimeSlotsFromRange(
  startTime: string,
  endTime: string,
  date: Date,
  duration: number,
  increment: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Parse start and end times (HH:mm format)
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Create start and end Date objects
  let currentSlot = setMinutes(setHours(date, startHour), startMinute);
  const rangeEnd = setMinutes(setHours(date, endHour), endMinute);

  // Generate slots with the specified increment
  while (isBefore(currentSlot, rangeEnd)) {
    // Check if the slot + duration would fit within the availability window
    const slotEnd = addMinutes(currentSlot, duration);

    if (isBefore(slotEnd, rangeEnd) || slotEnd.getTime() === rangeEnd.getTime()) {
      slots.push({
        time: currentSlot,
        formatted: format(currentSlot, "HH:mm"),
      });
    }

    currentSlot = addMinutes(currentSlot, increment);
  }

  return slots;
}

/**
 * Check if two time ranges overlap
 * @param slot - First time range
 * @param existing - Second time range
 * @returns True if the ranges overlap
 */
function isOverlapping(
  slot: { start: Date; end: Date },
  existing: { start: Date; end: Date }
): boolean {
  // Two ranges overlap if:
  // - slot starts before existing ends AND
  // - slot ends after existing starts
  return (
    isBefore(slot.start, existing.end) && isAfter(slot.end, existing.start)
  );
}
