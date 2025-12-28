"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { availability } from "@/lib/db/schema";
import { availabilitySchema } from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

/**
 * Update user's availability schedule
 * Replaces all existing availability slots with new ones
 */
export async function updateAvailabilityAction(
  formData: FormData
): Promise<ActionResult<typeof availability.$inferSelect[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Parse slots from formData
    const slotsJson = formData.get("slots");
    if (!slotsJson || typeof slotsJson !== "string") {
      return { success: false, error: "Validering misslyckades" };
    }

    let slots: AvailabilitySlot[];
    try {
      slots = JSON.parse(slotsJson);
    } catch {
      return { success: false, error: "Validering misslyckades" };
    }

    // Validate each slot
    const validatedSlots = z.array(availabilitySchema).parse(slots);

    // Delete all existing availability for this user
    await db
      .delete(availability)
      .where(eq(availability.userId, session.user.id));

    // Insert new availability slots
    if (validatedSlots.length > 0) {
      const newSlots = await db
        .insert(availability)
        .values(
          validatedSlots.map((slot) => ({
            userId: session.user.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        )
        .returning();

      revalidatePath("/tillganglighet");

      return { success: true, data: newSlots };
    }

    revalidatePath("/tillganglighet");

    return { success: true, data: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validering misslyckades" };
    }
    console.error("Failed to update availability:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}
