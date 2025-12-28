import { db } from "@/lib/db";
import { bookings, eventTypes } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, asc, ne, or } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import type { Booking, BookingStatus, EventLocation } from "@/types";

/**
 * Get all bookings for a user with optional filters
 */
export async function getBookingsByUserId(
  userId: string,
  filters?: {
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<
  Array<
    Booking & {
      eventType: {
        title: string;
      };
    }
  >
> {
  const conditions = [eq(bookings.userId, userId)];

  // Add status filter
  if (filters?.status) {
    conditions.push(eq(bookings.status, filters.status));
  }

  // Add date range filters
  if (filters?.startDate) {
    conditions.push(gte(bookings.startTime, startOfDay(filters.startDate)));
  }

  if (filters?.endDate) {
    conditions.push(lte(bookings.startTime, endOfDay(filters.endDate)));
  }

  let query = db
    .select({
      booking: bookings,
      eventType: {
        title: eventTypes.title,
      },
    })
    .from(bookings)
    .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
    .where(and(...conditions))
    .orderBy(desc(bookings.startTime));

  // Apply pagination
  if (filters?.limit !== undefined) {
    query = query.limit(filters.limit) as typeof query;
  }

  if (filters?.offset !== undefined) {
    query = query.offset(filters.offset) as typeof query;
  }

  const results = await query;

  return results.map((result) => ({
    ...(result.booking as Booking),
    eventType: result.eventType,
  }));
}

/**
 * Get upcoming bookings (confirmed, future dates)
 */
export async function getUpcomingBookings(
  userId: string,
  limit: number = 10
): Promise<Booking[]> {
  const now = new Date();

  const results = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed"),
        gte(bookings.startTime, now)
      )
    )
    .orderBy(asc(bookings.startTime))
    .limit(limit);

  return results as Booking[];
}

/**
 * Get upcoming bookings with event type details (for dashboard)
 */
export async function getUpcomingBookingsWithEventType(
  userId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestNotes: string | null;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  eventType: {
    title: string;
    duration: number;
  };
}>> {
  const now = new Date();

  const results = await db
    .select({
      id: bookings.id,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      guestNotes: bookings.guestNotes,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      eventType: {
        title: eventTypes.title,
        duration: eventTypes.duration,
      },
    })
    .from(bookings)
    .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed"),
        gte(bookings.startTime, now)
      )
    )
    .orderBy(asc(bookings.startTime))
    .limit(limit);

  return results.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    guestPhone: r.guestPhone,
    guestNotes: r.guestNotes,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status as BookingStatus,
    eventType: {
      title: r.eventType.title,
      duration: r.eventType.duration,
    },
  }));
}

/**
 * Get bookings for a specific date (for slot calculation)
 */
export async function getBookingsForDate(
  userId: string,
  date: Date
): Promise<Booking[]> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const results = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, dayStart),
        lte(bookings.startTime, dayEnd),
        // Only include active bookings (not cancelled)
        ne(bookings.status, "cancelled")
      )
    )
    .orderBy(asc(bookings.startTime));

  return results as Booking[];
}

/**
 * Get single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const results = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  return results.length > 0 ? (results[0] as Booking) : null;
}

/**
 * Get single booking by ID with event type relation
 */
export async function getBookingByIdWithEventType(id: string): Promise<
  | (Booking & {
      eventType: {
        id: string;
        title: string;
        duration: number;
        location: EventLocation | null;
      };
    })
  | null
> {
  const results = await db
    .select({
      booking: bookings,
      eventType: {
        id: eventTypes.id,
        title: eventTypes.title,
        duration: eventTypes.duration,
        location: eventTypes.location,
      },
    })
    .from(bookings)
    .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
    .where(eq(bookings.id, id))
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const result = results[0];
  return {
    ...(result.booking as Booking),
    eventType: result.eventType,
  };
}

/**
 * Create a new booking
 */
export async function createBooking(data: {
  eventTypeId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestNotes?: string;
  startTime: Date;
  endTime: Date;
}): Promise<Booking> {
  const results = await db
    .insert(bookings)
    .values({
      eventTypeId: data.eventTypeId,
      userId: data.userId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestNotes: data.guestNotes,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "pending",
    })
    .returning();

  return results[0] as Booking;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const results = await db
    .update(bookings)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();

  if (results.length === 0) {
    throw new Error(`Booking with id ${id} not found`);
  }

  return results[0] as Booking;
}

/**
 * Cancel a booking with optional reason
 */
export async function cancelBooking(
  id: string,
  reason?: string
): Promise<Booking> {
  const results = await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();

  if (results.length === 0) {
    throw new Error(`Booking with id ${id} not found`);
  }

  return results[0] as Booking;
}

/**
 * Check if a time slot is available (no conflicts)
 * Returns true if the slot is available, false if there are conflicts
 */
export async function isSlotAvailable(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conditions = [
    eq(bookings.userId, userId),
    // Only check non-cancelled bookings
    ne(bookings.status, "cancelled"),
    // Check for overlapping bookings
    // A booking overlaps if:
    // 1. It starts before this slot ends AND
    // 2. It ends after this slot starts
    or(
      and(
        lte(bookings.startTime, startTime),
        gte(bookings.endTime, startTime)
      ),
      and(
        lte(bookings.startTime, endTime),
        gte(bookings.endTime, endTime)
      ),
      and(
        gte(bookings.startTime, startTime),
        lte(bookings.endTime, endTime)
      )
    ),
  ];

  // Exclude a specific booking (useful for rescheduling)
  if (excludeBookingId) {
    conditions.push(ne(bookings.id, excludeBookingId));
  }

  const conflictingBookings = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(...conditions))
    .limit(1);

  // Slot is available if no conflicting bookings were found
  return conflictingBookings.length === 0;
}
