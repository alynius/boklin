import { db } from "@/lib/db";
import { users, eventTypes, bookings, availability } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

// Re-export calendar queries
export * from "./queries/calendar";

/**
 * Get a user by their ID
 * @param id - The user's UUID
 * @returns User object or null if not found
 */
export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user || null;
}

/**
 * Get a user by their username
 * @param username - The username to search for
 * @returns User object or null if not found
 */
export async function getUserByUsername(username: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      image: users.image,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user || null;
}

/**
 * Get all active public event types for a user
 * @param userId - The user's UUID
 * @returns Array of active event types
 */
export async function getPublicEventTypes(userId: string) {
  const activeEventTypes = await db
    .select({
      id: eventTypes.id,
      slug: eventTypes.slug,
      title: eventTypes.title,
      description: eventTypes.description,
      duration: eventTypes.duration,
      price: eventTypes.price,
      location: eventTypes.location,
    })
    .from(eventTypes)
    .where(and(eq(eventTypes.userId, userId), eq(eventTypes.isActive, true)))
    .orderBy(eventTypes.createdAt);

  return activeEventTypes;
}

/**
 * Get all event types for a user (for dashboard)
 * @param userId - The user's UUID
 * @returns Array of all event types
 */
export async function getEventTypesByUserId(userId: string) {
  const userEventTypes = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.userId, userId))
    .orderBy(eventTypes.createdAt);

  // Convert null to undefined for TypeScript compatibility
  return userEventTypes.map((et) => ({
    ...et,
    description: et.description || undefined,
    price: et.price || undefined,
    currency: (et.currency || "SEK") as "SEK",
    location: et.location || undefined,
    color: et.color || undefined,
  }));
}

/**
 * Get a specific event type by ID
 * @param id - The event type UUID
 * @returns Event type or null if not found
 */
export async function getEventTypeById(id: string) {
  const [eventType] = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.id, id))
    .limit(1);

  if (!eventType) return null;

  // Convert null to undefined for TypeScript compatibility
  return {
    ...eventType,
    description: eventType.description || undefined,
    price: eventType.price || undefined,
    currency: (eventType.currency || "SEK") as "SEK",
    location: eventType.location || undefined,
    color: eventType.color || undefined,
  };
}

/**
 * Get a specific event type by slug for a user
 * @param userId - The user's UUID
 * @param slug - The event type slug
 * @returns Event type with user info or null if not found
 */
export async function getEventTypeBySlug(userId: string, slug: string) {
  const [eventType] = await db
    .select({
      id: eventTypes.id,
      userId: eventTypes.userId,
      title: eventTypes.title,
      slug: eventTypes.slug,
      description: eventTypes.description,
      duration: eventTypes.duration,
      price: eventTypes.price,
      currency: eventTypes.currency,
      location: eventTypes.location,
      isActive: eventTypes.isActive,
      requiresConfirmation: eventTypes.requiresConfirmation,
      bufferBefore: eventTypes.bufferBefore,
      bufferAfter: eventTypes.bufferAfter,
      minNotice: eventTypes.minNotice,
      maxFuture: eventTypes.maxFuture,
      createdAt: eventTypes.createdAt,
      updatedAt: eventTypes.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        timezone: users.timezone,
      },
    })
    .from(eventTypes)
    .innerJoin(users, eq(eventTypes.userId, users.id))
    .where(and(eq(eventTypes.userId, userId), eq(eventTypes.slug, slug)))
    .limit(1);

  if (!eventType) return null;

  // Type guard to ensure user fields are not null
  if (!eventType.user.name || !eventType.user.username || !eventType.user.timezone) {
    return null;
  }

  return {
    id: eventType.id,
    userId: eventType.userId,
    title: eventType.title,
    slug: eventType.slug,
    description: eventType.description || undefined,
    duration: eventType.duration,
    price: eventType.price || undefined,
    currency: (eventType.currency || "SEK") as "SEK",
    location: eventType.location || undefined,
    isActive: eventType.isActive,
    requiresConfirmation: eventType.requiresConfirmation,
    bufferBefore: eventType.bufferBefore,
    bufferAfter: eventType.bufferAfter,
    minNotice: eventType.minNotice,
    maxFuture: eventType.maxFuture,
    createdAt: eventType.createdAt,
    updatedAt: eventType.updatedAt,
    user: {
      id: eventType.user.id,
      name: eventType.user.name,
      username: eventType.user.username,
      timezone: eventType.user.timezone,
    },
  };
}

/**
 * Get availability for a user
 * @param userId - The user's UUID
 * @returns Array of availability slots
 */
export async function getAvailabilityByUserId(userId: string) {
  const userAvailability = await db
    .select()
    .from(availability)
    .where(eq(availability.userId, userId))
    .orderBy(availability.dayOfWeek, availability.startTime);

  return userAvailability;
}

/**
 * Get upcoming bookings with event type details
 * @param userId - The user's UUID
 * @param limit - Maximum number of bookings to return
 * @returns Array of bookings with event type info
 */
export async function getUpcomingBookingsWithEventType(
  userId: string,
  limit: number = 10
) {
  const now = new Date();
  const upcomingBookings = await db
    .select({
      id: bookings.id,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      eventType: {
        id: eventTypes.id,
        title: eventTypes.title,
        duration: eventTypes.duration,
      },
    })
    .from(bookings)
    .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
    .where(and(eq(bookings.userId, userId), gte(bookings.startTime, now)))
    .orderBy(bookings.startTime)
    .limit(limit);

  return upcomingBookings;
}

/**
 * Get user statistics for dashboard
 * @param userId - The user's UUID
 * @returns User statistics with today, this week, this month, and total counts
 */
export async function getUserStats(userId: string) {
  const now = new Date();

  // Helper to get start and end of day
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Helper to get start of week (Monday)
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper to get start of month
  const startOfMonth = (date: Date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  // Count today's bookings
  const [todayResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, todayStart),
        lte(bookings.startTime, todayEnd),
        eq(bookings.status, "confirmed")
      )
    );

  // Count this week's bookings
  const [weekResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, weekStart),
        eq(bookings.status, "confirmed")
      )
    );

  // Count this month's bookings
  const [monthResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, monthStart),
        eq(bookings.status, "confirmed")
      )
    );

  // Count total bookings (all time)
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed")
      )
    );

  return {
    today: todayResult?.count || 0,
    thisWeek: weekResult?.count || 0,
    thisMonth: monthResult?.count || 0,
    total: totalResult?.count || 0,
  };
}
