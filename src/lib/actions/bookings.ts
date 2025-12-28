"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, eventTypes, users } from "@/lib/db/schema";
import { bookingFormSchema } from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";
import { eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { getValidAccessToken } from "@/lib/db/queries/calendar";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/calendar/google";
import {
  sendBookingConfirmation,
  sendBookingNotification,
  sendBookingCancellation,
  sendEmailSafely,
} from "@/lib/email";
import type { BookingWithDetails } from "@/lib/email/types";
import type { BookingStatus } from "@/types";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper function to fetch booking with all related details for email sending
 */
async function getBookingWithDetails(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const [result] = await db
    .select({
      id: bookings.id,
      eventTypeId: bookings.eventTypeId,
      userId: bookings.userId,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      guestNotes: bookings.guestNotes,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      cancelledAt: bookings.cancelledAt,
      cancelReason: bookings.cancelReason,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      eventType: {
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
      },
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
      },
    })
    .from(bookings)
    .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  return result || null;
}

/**
 * Create a new booking (guest-facing action)
 * No authentication required - guests can book
 */
export async function createBookingAction(
  eventTypeId: string,
  formData: FormData
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    // Parse and validate form data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      notes: formData.get("notes") || undefined,
      startTime: formData.get("startTime")
        ? new Date(formData.get("startTime") as string)
        : undefined,
    };

    const validatedData = bookingFormSchema.parse(rawData);

    // Get event type to calculate end time and verify it exists
    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(eq(eventTypes.id, eventTypeId))
      .limit(1);

    if (!eventType) {
      return { success: false, error: "Mötestypen kunde inte hittas" };
    }

    if (!eventType.isActive) {
      return { success: false, error: "Mötestypen är inte längre tillgänglig" };
    }

    // Calculate end time
    const endTime = new Date(validatedData.startTime);
    endTime.setMinutes(endTime.getMinutes() + eventType.duration);

    // Check for overlapping bookings (race condition protection)
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, eventType.userId),
          eq(bookings.status, "confirmed"),
          gte(bookings.endTime, validatedData.startTime),
          lte(bookings.startTime, endTime)
        )
      );

    if (overlappingBookings.length > 0) {
      return { success: false, error: "Tiden är inte längre tillgänglig" };
    }

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        eventTypeId,
        userId: eventType.userId,
        guestName: validatedData.name,
        guestEmail: validatedData.email,
        guestPhone: validatedData.phone || null,
        guestNotes: validatedData.notes || null,
        startTime: validatedData.startTime,
        endTime,
        status: eventType.requiresConfirmation ? "pending" : "confirmed",
      })
      .returning();

    // Create Google Calendar event if user has calendar connected
    try {
      const accessToken = await getValidAccessToken(eventType.userId, "google");
      if (accessToken) {
        // Get user details for calendar event
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, eventType.userId))
          .limit(1);

        if (user) {
          const calendarEventId = await createCalendarEvent(accessToken, {
            id: booking.id,
            eventTypeId: booking.eventTypeId,
            userId: booking.userId,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestPhone: booking.guestPhone || undefined,
            guestNotes: booking.guestNotes || undefined,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status as BookingStatus,
            calendarEventId: undefined,
            cancelledAt: undefined,
            cancelReason: undefined,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            eventType: {
              title: eventType.title,
              duration: eventType.duration,
              location: eventType.location,
            },
            user: {
              name: user.name || "",
              email: user.email,
            },
          });

          // Update booking with calendar event ID
          await db
            .update(bookings)
            .set({ calendarEventId })
            .where(eq(bookings.id, booking.id));
        }
      }
    } catch (error) {
      console.error("Failed to create calendar event:", error);
      // Don't fail the booking if calendar event creation fails
    }

    // Send emails asynchronously (don't block booking creation)
    // Fetch booking with full details for email templates
    const bookingWithDetails = await getBookingWithDetails(booking.id);
    if (bookingWithDetails) {
      // Send confirmation email to guest
      await sendEmailSafely(
        () => sendBookingConfirmation(bookingWithDetails),
        "booking confirmation"
      );

      // Send notification email to host
      await sendEmailSafely(
        () => sendBookingNotification(bookingWithDetails),
        "booking notification"
      );
    }

    revalidatePath("/bokningar");

    return { success: true, data: booking };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validering misslyckades" };
    }
    console.error("Failed to create booking:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}

/**
 * Cancel a booking (host-only action)
 */
export async function cancelBookingAction(
  id: string,
  reason?: string
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Verify ownership
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, session.user.id)))
      .limit(1);

    if (!existingBooking) {
      return { success: false, error: "Du har inte behörighet" };
    }

    if (existingBooking.status === "cancelled") {
      return { success: false, error: "Bokningen är redan avbokad" };
    }

    // Delete Google Calendar event if it exists
    if (existingBooking.calendarEventId) {
      try {
        const accessToken = await getValidAccessToken(session.user.id, "google");
        if (accessToken) {
          await deleteCalendarEvent(accessToken, existingBooking.calendarEventId);
        }
      } catch (error) {
        console.error("Failed to delete calendar event:", error);
        // Continue with cancellation even if calendar deletion fails
      }
    }

    // Update booking status to cancelled
    const [booking] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    // Send cancellation email to guest
    const bookingWithDetails = await getBookingWithDetails(booking.id);
    if (bookingWithDetails) {
      await sendEmailSafely(
        () => sendBookingCancellation(bookingWithDetails, reason),
        "booking cancellation"
      );
    }

    revalidatePath("/bokningar");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}

/**
 * Confirm a pending booking (host-only action)
 */
export async function confirmBookingAction(
  id: string
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Verify ownership
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, session.user.id)))
      .limit(1);

    if (!existingBooking) {
      return { success: false, error: "Du har inte behörighet" };
    }

    if (existingBooking.status === "confirmed") {
      return { success: false, error: "Bokningen är redan bekräftad" };
    }

    if (existingBooking.status === "cancelled") {
      return { success: false, error: "Bokningen är avbokad" };
    }

    // Update booking status to confirmed
    const [booking] = await db
      .update(bookings)
      .set({
        status: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    // Send confirmation email to guest
    const bookingWithDetails = await getBookingWithDetails(booking.id);
    if (bookingWithDetails) {
      await sendEmailSafely(
        () => sendBookingConfirmation(bookingWithDetails),
        "booking confirmation"
      );
    }

    revalidatePath("/bokningar");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Failed to confirm booking:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}
