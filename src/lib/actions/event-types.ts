"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventTypes } from "@/lib/db/schema";
import { eventTypeSchema } from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a new event type for the authenticated user
 */
export async function createEventTypeAction(
  formData: FormData
): Promise<ActionResult<typeof eventTypes.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description") || undefined,
      duration: Number(formData.get("duration")),
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      isActive: formData.get("isActive") === "true",
      requiresConfirmation: formData.get("requiresConfirmation") === "true",
      bufferBefore: formData.get("bufferBefore")
        ? Number(formData.get("bufferBefore"))
        : 0,
      bufferAfter: formData.get("bufferAfter")
        ? Number(formData.get("bufferAfter"))
        : 0,
      minNotice: formData.get("minNotice")
        ? Number(formData.get("minNotice"))
        : 24,
      maxFuture: formData.get("maxFuture")
        ? Number(formData.get("maxFuture"))
        : 60,
      location: formData.get("location")
        ? JSON.parse(formData.get("location") as string)
        : undefined,
    };

    const validatedData = eventTypeSchema.parse(rawData);

    // Convert price to öre if provided
    const priceInOre = validatedData.price
      ? Math.round(validatedData.price * 100)
      : null;

    // Create event type
    const [eventType] = await db
      .insert(eventTypes)
      .values({
        userId: session.user.id,
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description || null,
        duration: validatedData.duration,
        price: priceInOre,
        location: validatedData.location || null,
        isActive: validatedData.isActive,
        requiresConfirmation: validatedData.requiresConfirmation,
        bufferBefore: validatedData.bufferBefore,
        bufferAfter: validatedData.bufferAfter,
        minNotice: validatedData.minNotice,
        maxFuture: validatedData.maxFuture,
      })
      .returning();

    revalidatePath("/motestyper");

    return { success: true, data: eventType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validering misslyckades" };
    }
    console.error("Failed to create event type:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}

/**
 * Update an existing event type
 */
export async function updateEventTypeAction(
  id: string,
  formData: FormData
): Promise<ActionResult<typeof eventTypes.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Verify ownership
    const [existingEventType] = await db
      .select()
      .from(eventTypes)
      .where(and(eq(eventTypes.id, id), eq(eventTypes.userId, session.user.id)))
      .limit(1);

    if (!existingEventType) {
      return { success: false, error: "Du har inte behörighet" };
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description") || undefined,
      duration: Number(formData.get("duration")),
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      isActive: formData.get("isActive") === "true",
      requiresConfirmation: formData.get("requiresConfirmation") === "true",
      bufferBefore: formData.get("bufferBefore")
        ? Number(formData.get("bufferBefore"))
        : 0,
      bufferAfter: formData.get("bufferAfter")
        ? Number(formData.get("bufferAfter"))
        : 0,
      minNotice: formData.get("minNotice")
        ? Number(formData.get("minNotice"))
        : 24,
      maxFuture: formData.get("maxFuture")
        ? Number(formData.get("maxFuture"))
        : 60,
      location: formData.get("location")
        ? JSON.parse(formData.get("location") as string)
        : undefined,
    };

    const validatedData = eventTypeSchema.parse(rawData);

    // Convert price to öre if provided
    const priceInOre = validatedData.price
      ? Math.round(validatedData.price * 100)
      : null;

    // Update event type
    const [eventType] = await db
      .update(eventTypes)
      .set({
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description || null,
        duration: validatedData.duration,
        price: priceInOre,
        location: validatedData.location || null,
        isActive: validatedData.isActive,
        requiresConfirmation: validatedData.requiresConfirmation,
        bufferBefore: validatedData.bufferBefore,
        bufferAfter: validatedData.bufferAfter,
        minNotice: validatedData.minNotice,
        maxFuture: validatedData.maxFuture,
        updatedAt: new Date(),
      })
      .where(eq(eventTypes.id, id))
      .returning();

    revalidatePath("/motestyper");

    return { success: true, data: eventType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validering misslyckades" };
    }
    console.error("Failed to update event type:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}

/**
 * Delete an event type
 */
export async function deleteEventTypeAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Verify ownership
    const [existingEventType] = await db
      .select()
      .from(eventTypes)
      .where(and(eq(eventTypes.id, id), eq(eventTypes.userId, session.user.id)))
      .limit(1);

    if (!existingEventType) {
      return { success: false, error: "Du har inte behörighet" };
    }

    // Delete event type
    await db.delete(eventTypes).where(eq(eventTypes.id, id));

    revalidatePath("/motestyper");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete event type:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}

/**
 * Toggle the active status of an event type
 */
export async function toggleEventTypeActiveAction(
  id: string
): Promise<ActionResult<typeof eventTypes.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Verify ownership and get current status
    const [existingEventType] = await db
      .select()
      .from(eventTypes)
      .where(and(eq(eventTypes.id, id), eq(eventTypes.userId, session.user.id)))
      .limit(1);

    if (!existingEventType) {
      return { success: false, error: "Du har inte behörighet" };
    }

    // Toggle active status
    const [eventType] = await db
      .update(eventTypes)
      .set({
        isActive: !existingEventType.isActive,
        updatedAt: new Date(),
      })
      .where(eq(eventTypes.id, id))
      .returning();

    revalidatePath("/motestyper");

    return { success: true, data: eventType };
  } catch (error) {
    console.error("Failed to toggle event type:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}
