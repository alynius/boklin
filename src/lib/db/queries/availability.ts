import { db } from "@/lib/db";
import { availability } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Availability, DayOfWeek } from "@/types";

/**
 * Input type for creating/updating availability slots
 */
export interface AvailabilityInput {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

/**
 * Get all availability slots for a user
 * @param userId - The user's UUID
 * @returns Array of availability slots
 */
export async function getAvailabilityByUserId(
  userId: string
): Promise<Availability[]> {
  const slots = await db
    .select()
    .from(availability)
    .where(eq(availability.userId, userId));

  return slots as Availability[];
}

/**
 * Get availability for a specific day of week
 * @param userId - The user's UUID
 * @param dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 * @returns Array of availability slots for that day
 */
export async function getAvailabilityForDay(
  userId: string,
  dayOfWeek: DayOfWeek
): Promise<Availability[]> {
  const slots = await db
    .select()
    .from(availability)
    .where(
      and(eq(availability.userId, userId), eq(availability.dayOfWeek, dayOfWeek))
    );

  return slots as Availability[];
}

/**
 * Set/replace all availability for a user
 * Deletes existing availability and inserts new slots in a transaction
 * @param userId - The user's UUID
 * @param slots - Array of availability slots to set
 */
export async function setAvailability(
  userId: string,
  slots: AvailabilityInput[]
): Promise<void> {
  await db.transaction(async (tx) => {
    // Delete all existing availability for this user
    await tx.delete(availability).where(eq(availability.userId, userId));

    // Insert new availability slots if any provided
    if (slots.length > 0) {
      await tx.insert(availability).values(
        slots.map((slot) => ({
          userId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      );
    }
  });
}

/**
 * Add a single availability slot
 * @param userId - The user's UUID
 * @param slot - The availability slot to add
 * @returns The created availability slot
 */
export async function addAvailabilitySlot(
  userId: string,
  slot: AvailabilityInput
): Promise<Availability> {
  const [newSlot] = await db
    .insert(availability)
    .values({
      userId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })
    .returning();

  return newSlot as Availability;
}

/**
 * Remove an availability slot
 * @param id - The UUID of the availability slot to remove
 */
export async function removeAvailabilitySlot(id: string): Promise<void> {
  await db.delete(availability).where(eq(availability.id, id));
}
