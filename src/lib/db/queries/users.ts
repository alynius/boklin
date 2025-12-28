import { db } from "@/lib/db";
import { users, bookings } from "@/lib/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { User } from "@/types";

/**
 * Get user by ID
 * @param id User UUID
 * @returns User object or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      image: users.image,
      timezone: users.timezone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    username: user.username ?? "",
    image: user.image ?? undefined,
    timezone: user.timezone ?? "Europe/Stockholm",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Get user by username (for public booking pages)
 * @param username Unique username slug
 * @returns User object or null if not found
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      image: users.image,
      timezone: users.timezone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    username: user.username ?? "",
    image: user.image ?? undefined,
    timezone: user.timezone ?? "Europe/Stockholm",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update user profile
 * @param id User UUID
 * @param data Partial user data to update
 * @returns Updated user object
 */
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Only include fields that are being updated
  if (data.name !== undefined) updateData.name = data.name;
  if (data.username !== undefined) updateData.username = data.username;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      image: users.image,
      timezone: users.timezone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name ?? "",
    username: updatedUser.username ?? "",
    image: updatedUser.image ?? undefined,
    timezone: updatedUser.timezone ?? "Europe/Stockholm",
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
}

/**
 * Get dashboard statistics for a user
 * Counts confirmed bookings across different time periods
 * @param userId User UUID
 * @returns Stats object with booking counts
 */
export async function getUserStats(userId: string): Promise<{
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}> {
  const now = new Date();

  // Calculate date ranges
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Query for today's bookings
  const [todayResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, todayStart),
        lte(bookings.startTime, todayEnd),
        eq(bookings.status, "confirmed")
      )
    );

  // Query for this week's bookings
  const [weekResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, weekStart),
        lte(bookings.startTime, weekEnd),
        eq(bookings.status, "confirmed")
      )
    );

  // Query for this month's bookings
  const [monthResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, monthStart),
        lte(bookings.startTime, monthEnd),
        eq(bookings.status, "confirmed")
      )
    );

  // Query for total bookings (all time, confirmed)
  const [totalResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed")
      )
    );

  return {
    today: todayResult?.count ?? 0,
    thisWeek: weekResult?.count ?? 0,
    thisMonth: monthResult?.count ?? 0,
    total: totalResult?.count ?? 0,
  };
}
