import { db } from "@/lib/db";
import { eventTypes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import type { EventType } from "@/types";

/**
 * Input type for creating event types
 */
export interface EventTypeInput {
  title: string;
  slug?: string;
  description?: string;
  duration: number;
  price?: number;
  currency?: "SEK";
  location?: EventType["location"];
  color?: string;
  isActive?: boolean;
  requiresConfirmation?: boolean;
  bufferBefore?: number;
  bufferAfter?: number;
  minNotice?: number;
  maxFuture?: number;
}

/**
 * Convert database result to EventType (converts null to undefined)
 */
function toEventType(row: typeof eventTypes.$inferSelect): EventType {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    slug: row.slug,
    description: row.description ?? undefined,
    duration: row.duration,
    price: row.price ?? undefined,
    currency: (row.currency as "SEK") ?? "SEK",
    location: row.location ?? undefined,
    color: row.color ?? undefined,
    isActive: row.isActive,
    requiresConfirmation: row.requiresConfirmation,
    bufferBefore: row.bufferBefore,
    bufferAfter: row.bufferAfter,
    minNotice: row.minNotice,
    maxFuture: row.maxFuture,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get all event types for a user (dashboard)
 */
export async function getEventTypesByUserId(userId: string): Promise<EventType[]> {
  const results = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.userId, userId))
    .orderBy(eventTypes.createdAt);

  return results.map(toEventType);
}

/**
 * Get single event type by ID
 */
export async function getEventTypeById(id: string): Promise<EventType | null> {
  const results = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.id, id))
    .limit(1);

  return results[0] ? toEventType(results[0]) : null;
}

/**
 * Get event type by slug for a specific user (public booking)
 */
export async function getEventTypeBySlug(
  userId: string,
  slug: string
): Promise<EventType | null> {
  const results = await db
    .select()
    .from(eventTypes)
    .where(and(eq(eventTypes.userId, userId), eq(eventTypes.slug, slug)))
    .limit(1);

  return results[0] ? toEventType(results[0]) : null;
}

/**
 * Get active public event types for a username (public profile page)
 */
export async function getPublicEventTypes(username: string): Promise<EventType[]> {
  const results = await db
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
      color: eventTypes.color,
      isActive: eventTypes.isActive,
      requiresConfirmation: eventTypes.requiresConfirmation,
      bufferBefore: eventTypes.bufferBefore,
      bufferAfter: eventTypes.bufferAfter,
      minNotice: eventTypes.minNotice,
      maxFuture: eventTypes.maxFuture,
      createdAt: eventTypes.createdAt,
      updatedAt: eventTypes.updatedAt,
    })
    .from(eventTypes)
    .innerJoin(users, eq(eventTypes.userId, users.id))
    .where(and(eq(users.username, username), eq(eventTypes.isActive, true)))
    .orderBy(eventTypes.createdAt);

  return results.map(toEventType);
}

/**
 * Create new event type
 */
export async function createEventType(
  userId: string,
  data: EventTypeInput
): Promise<EventType> {
  // Generate slug from title if not provided
  const slug = data.slug ?? slugify(data.title);

  const [result] = await db
    .insert(eventTypes)
    .values({
      userId,
      title: data.title,
      slug,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency ?? "SEK",
      location: data.location,
      color: data.color,
      isActive: data.isActive ?? true,
      requiresConfirmation: data.requiresConfirmation ?? false,
      bufferBefore: data.bufferBefore ?? 0,
      bufferAfter: data.bufferAfter ?? 0,
      minNotice: data.minNotice ?? 24,
      maxFuture: data.maxFuture ?? 60,
    })
    .returning();

  return toEventType(result);
}

/**
 * Update event type
 */
export async function updateEventType(
  id: string,
  data: Partial<EventTypeInput>
): Promise<EventType> {
  // If title is being updated and slug is not provided, regenerate slug
  const updates: Partial<typeof eventTypes.$inferInsert> = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.title && !data.slug) {
    updates.slug = slugify(data.title);
  }

  const [result] = await db
    .update(eventTypes)
    .set(updates)
    .where(eq(eventTypes.id, id))
    .returning();

  return toEventType(result);
}

/**
 * Delete event type
 */
export async function deleteEventType(id: string): Promise<void> {
  await db.delete(eventTypes).where(eq(eventTypes.id, id));
}

/**
 * Toggle event type active status
 */
export async function toggleEventTypeActive(id: string): Promise<EventType> {
  // First get the current event type
  const eventType = await getEventTypeById(id);
  if (!eventType) {
    throw new Error("Event type not found");
  }

  const [result] = await db
    .update(eventTypes)
    .set({
      isActive: !eventType.isActive,
      updatedAt: new Date(),
    })
    .where(eq(eventTypes.id, id))
    .returning();

  return toEventType(result);
}
