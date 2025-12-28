import { db } from "@/lib/db";
import { calendarConnections } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { CalendarConnection, CalendarProvider } from "@/types";

/**
 * Get calendar connection for a user
 * @param userId - User UUID
 * @param provider - Calendar provider (optional, defaults to any)
 */
export async function getCalendarConnection(
  userId: string,
  provider?: CalendarProvider
): Promise<CalendarConnection | null> {
  const conditions = [eq(calendarConnections.userId, userId)];

  if (provider) {
    conditions.push(eq(calendarConnections.provider, provider));
  }

  const [connection] = await db
    .select()
    .from(calendarConnections)
    .where(and(...conditions))
    .limit(1);

  if (!connection) {
    return null;
  }

  return connection as CalendarConnection;
}

/**
 * Get Google Calendar connection for a user
 * @param userId - User UUID
 */
export async function getGoogleCalendarConnection(
  userId: string
): Promise<CalendarConnection | null> {
  return getCalendarConnection(userId, "google");
}

/**
 * Save or update calendar connection
 * @param data - Calendar connection data
 */
export async function saveCalendarConnection(data: {
  userId: string;
  provider: CalendarProvider;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  isPrimary?: boolean;
}): Promise<CalendarConnection> {
  // Check if connection already exists
  const existing = await getCalendarConnection(data.userId, data.provider);

  if (existing) {
    // Update existing connection
    const [updated] = await db
      .update(calendarConnections)
      .set({
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        isPrimary: data.isPrimary ?? existing.isPrimary,
      })
      .where(eq(calendarConnections.id, existing.id))
      .returning();

    return updated as CalendarConnection;
  } else {
    // Create new connection
    const [created] = await db
      .insert(calendarConnections)
      .values({
        userId: data.userId,
        provider: data.provider,
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        isPrimary: data.isPrimary ?? true,
      })
      .returning();

    return created as CalendarConnection;
  }
}

/**
 * Remove calendar connection
 * @param userId - User UUID
 * @param provider - Calendar provider (optional, removes all if not specified)
 */
export async function removeCalendarConnection(
  userId: string,
  provider?: CalendarProvider
): Promise<void> {
  const conditions = [eq(calendarConnections.userId, userId)];

  if (provider) {
    conditions.push(eq(calendarConnections.provider, provider));
  }

  await db
    .delete(calendarConnections)
    .where(and(...conditions));
}

/**
 * Update calendar access tokens (after refresh)
 * @param userId - User UUID
 * @param provider - Calendar provider
 * @param accessToken - New access token
 * @param expiresAt - New expiry date
 */
export async function updateCalendarTokens(
  userId: string,
  provider: CalendarProvider,
  accessToken: string,
  expiresAt: Date
): Promise<void> {
  await db
    .update(calendarConnections)
    .set({
      accessToken,
      expiresAt,
    })
    .where(
      and(
        eq(calendarConnections.userId, userId),
        eq(calendarConnections.provider, provider)
      )
    );
}

/**
 * Get valid access token (refresh if expired)
 * @param userId - User UUID
 * @param provider - Calendar provider
 * @returns Valid access token or null if connection doesn't exist
 */
export async function getValidAccessToken(
  userId: string,
  provider: CalendarProvider
): Promise<string | null> {
  const connection = await getCalendarConnection(userId, provider);

  if (!connection) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(connection.expiresAt);

  // If token expires in less than 5 minutes, refresh it
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (expiresAt <= fiveMinutesFromNow) {
    // Token is expired or about to expire, need to refresh
    try {
      const { refreshAccessToken } = await import("@/lib/calendar/google");
      const { accessToken, expiresAt: newExpiresAt } = await refreshAccessToken(
        connection.refreshToken
      );

      await updateCalendarTokens(userId, provider, accessToken, newExpiresAt);

      return accessToken;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return null;
    }
  }

  return connection.accessToken;
}
