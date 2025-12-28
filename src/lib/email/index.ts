import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingConfirmationEmail } from "./templates/booking-confirmation";
import { BookingNotificationEmail } from "./templates/booking-notification";
import { BookingCancelledEmail } from "./templates/booking-cancelled";
import type { BookingWithDetails, EmailResult } from "./types";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || "Boklin <noreply@boklin.se>";

/**
 * Send booking confirmation email to guest
 * Sent after booking is created (either pending or confirmed)
 */
export async function sendBookingConfirmation(
  booking: BookingWithDetails
): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = await render(
      BookingConfirmationEmail({
        guestName: booking.guestName,
        eventTitle: booking.eventType.title,
        eventDescription: booking.eventType.description || undefined,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.eventType.duration,
        hostName: booking.user.name || "Mötesvärd",
        hostEmail: booking.user.email,
        location: booking.eventType.location || undefined,
        bookingId: booking.id,
        requiresConfirmation: booking.eventType.requiresConfirmation,
      })
    );

    const subject =
      booking.status === "pending"
        ? `Bokningsförfrågan mottagen: ${booking.eventType.title}`
        : `Bokning bekräftad: ${booking.eventType.title} med ${booking.user.name || "Mötesvärd"}`;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.guestEmail,
      subject,
      html: emailHtml,
      replyTo: booking.user.email,
    });

    if (error) {
      console.error("Failed to send booking confirmation:", error);
      return { success: false, error: error.message };
    }

    console.log(`Booking confirmation sent to ${booking.guestEmail}`, data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send booking notification email to host
 * Sent after guest creates a booking
 */
export async function sendBookingNotification(
  booking: BookingWithDetails
): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = await render(
      BookingNotificationEmail({
        hostName: booking.user.name || "Mötesvärd",
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone || undefined,
        guestNotes: booking.guestNotes || undefined,
        eventTitle: booking.eventType.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.eventType.duration,
        location: booking.eventType.location || undefined,
        bookingId: booking.id,
        requiresConfirmation: booking.eventType.requiresConfirmation,
      })
    );

    const subject = booking.eventType.requiresConfirmation
      ? `Ny bokningsförfrågan: ${booking.eventType.title} från ${booking.guestName}`
      : `Ny bokning: ${booking.eventType.title} från ${booking.guestName}`;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.user.email,
      subject,
      html: emailHtml,
      replyTo: booking.guestEmail,
    });

    if (error) {
      console.error("Failed to send booking notification:", error);
      return { success: false, error: error.message };
    }

    console.log(`Booking notification sent to ${booking.user.email}`, data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending booking notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send booking cancellation email to guest
 * Sent when host cancels a booking
 */
export async function sendBookingCancellation(
  booking: BookingWithDetails,
  reason?: string
): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = await render(
      BookingCancelledEmail({
        guestName: booking.guestName,
        eventTitle: booking.eventType.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.eventType.duration,
        hostName: booking.user.name || "Mötesvärd",
        hostEmail: booking.user.email,
        username: booking.user.username || "user",
        eventSlug: booking.eventType.slug,
        cancelReason: reason || booking.cancelReason || undefined,
      })
    );

    const subject = `Bokning avbokad: ${booking.eventType.title}`;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.guestEmail,
      subject,
      html: emailHtml,
      replyTo: booking.user.email,
    });

    if (error) {
      console.error("Failed to send booking cancellation:", error);
      return { success: false, error: error.message };
    }

    console.log(`Booking cancellation sent to ${booking.guestEmail}`, data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending booking cancellation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send booking reminder email to guest
 * Can be used for scheduled reminders (e.g., 24h before booking)
 */
export async function sendBookingReminder(
  booking: BookingWithDetails
): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return { success: false, error: "Email service not configured" };
    }

    // Use the confirmation template with a reminder preview
    const emailHtml = await render(
      BookingConfirmationEmail({
        guestName: booking.guestName,
        eventTitle: booking.eventType.title,
        eventDescription: booking.eventType.description || undefined,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.eventType.duration,
        hostName: booking.user.name || "Mötesvärd",
        hostEmail: booking.user.email,
        location: booking.eventType.location || undefined,
        bookingId: booking.id,
        requiresConfirmation: false, // Already confirmed if we're sending reminder
      })
    );

    const subject = `Påminnelse: ${booking.eventType.title} med ${booking.user.name || "Mötesvärd"}`;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.guestEmail,
      subject,
      html: emailHtml,
      replyTo: booking.user.email,
    });

    if (error) {
      console.error("Failed to send booking reminder:", error);
      return { success: false, error: error.message };
    }

    console.log(`Booking reminder sent to ${booking.guestEmail}`, data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending booking reminder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper function to safely send emails without failing the main operation
 * Logs errors but returns void
 */
export async function sendEmailSafely(
  emailFn: () => Promise<EmailResult>,
  context: string
): Promise<void> {
  try {
    const result = await emailFn();
    if (!result.success) {
      console.error(`Failed to send ${context}:`, result.error);
    }
  } catch (error) {
    console.error(`Error sending ${context}:`, error);
  }
}
