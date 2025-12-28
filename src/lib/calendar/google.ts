import { google } from "googleapis";
import type { Booking, EventLocation } from "@/types";

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

/**
 * Create OAuth2 client for Google Calendar API
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  );
}

/**
 * Generate OAuth URL for connecting calendar
 * @param userId - User ID to encode in state parameter for security
 */
export function getGoogleAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: CALENDAR_SCOPES,
    state: Buffer.from(JSON.stringify({ userId })).toString("base64"),
    prompt: "consent", // Force consent to ensure we get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from OAuth callback
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}> {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Failed to obtain access and refresh tokens");
  }

  const expiresAt = new Date();
  if (tokens.expiry_date) {
    expiresAt.setTime(tokens.expiry_date);
  } else {
    // Default to 1 hour if not provided
    expiresAt.setHours(expiresAt.getHours() + 1);
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
  };
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - The refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  const expiresAt = new Date();
  if (credentials.expiry_date) {
    expiresAt.setTime(credentials.expiry_date);
  } else {
    expiresAt.setHours(expiresAt.getHours() + 1);
  }

  return {
    accessToken: credentials.access_token,
    expiresAt,
  };
}

/**
 * Get busy times from Google Calendar
 * @param accessToken - Valid access token
 * @param startDate - Start date for query
 * @param endDate - End date for query
 */
export async function getCalendarBusyTimes(
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ start: Date; end: Date }>> {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busyTimes: Array<{ start: Date; end: Date }> = [];
    const calendars = response.data.calendars;

    if (calendars && calendars.primary && calendars.primary.busy) {
      for (const busySlot of calendars.primary.busy) {
        if (busySlot.start && busySlot.end) {
          busyTimes.push({
            start: new Date(busySlot.start),
            end: new Date(busySlot.end),
          });
        }
      }
    }

    return busyTimes;
  } catch (error) {
    console.error("Failed to fetch calendar busy times:", error);
    // Return empty array on error to not block booking flow
    return [];
  }
}

/**
 * Create calendar event for a booking
 * @param accessToken - Valid access token
 * @param booking - Booking details with event type
 */
export async function createCalendarEvent(
  accessToken: string,
  booking: Booking & {
    eventType: {
      title: string;
      duration: number;
      location?: EventLocation | null;
    };
    user: {
      name: string;
      email: string;
    };
  }
): Promise<string> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Build location string
  let locationString = "";
  if (booking.eventType.location) {
    const loc = booking.eventType.location;
    if (loc.type === "in_person" && loc.address) {
      locationString = loc.address;
    } else if (loc.type === "video" && loc.link) {
      locationString = loc.link;
    } else if (loc.type === "phone" && loc.phone) {
      locationString = `Tel: ${loc.phone}`;
    } else if (loc.type === "custom" && loc.instructions) {
      locationString = loc.instructions;
    }
  }

  // Build description
  const description = [
    `Bokning via Boklin`,
    ``,
    `Gäst: ${booking.guestName}`,
    `Email: ${booking.guestEmail}`,
    booking.guestPhone ? `Telefon: ${booking.guestPhone}` : null,
    booking.guestNotes ? `\nAnteckningar:\n${booking.guestNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const event = {
    summary: `${booking.eventType.title} - ${booking.guestName}`,
    description,
    location: locationString || undefined,
    start: {
      dateTime: booking.startTime.toISOString(),
      timeZone: "Europe/Stockholm",
    },
    end: {
      dateTime: booking.endTime.toISOString(),
      timeZone: "Europe/Stockholm",
    },
    attendees: [
      { email: booking.guestEmail, displayName: booking.guestName },
      { email: booking.user.email, displayName: booking.user.name },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 30 }, // 30 minutes before
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    sendUpdates: "all", // Send email to attendees
  });

  if (!response.data.id) {
    throw new Error("Failed to create calendar event");
  }

  return response.data.id;
}

/**
 * Delete calendar event
 * @param accessToken - Valid access token
 * @param eventId - Google Calendar event ID
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all", // Notify attendees
    });
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    // Don't throw - calendar event deletion failure shouldn't block booking cancellation
  }
}

/**
 * Get user's email from Google Calendar (for storing connection)
 * @param accessToken - Valid access token
 */
export async function getCalendarEmail(accessToken: string): Promise<string> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const response = await calendar.calendarList.get({
    calendarId: "primary",
  });

  return response.data.id || "";
}
