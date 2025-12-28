"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { profileSchema, timezoneSchema } from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Update user profile (name and username)
 */
export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult<typeof users.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name"),
      username: formData.get("username"),
    };

    const validatedData = profileSchema.parse(rawData);

    // Check if username is already taken by another user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, validatedData.username),
          ne(users.id, session.user.id)
        )
      )
      .limit(1);

    if (existingUser) {
      return { success: false, error: "Användarnamnet är redan upptaget" };
    }

    // Update user profile
    const [user] = await db
      .update(users)
      .set({
        name: validatedData.name,
        username: validatedData.username,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    revalidatePath("/installningar");

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validering misslyckades" };
    }
    console.error("Failed to update profile:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}

/**
 * Update user timezone
 */
export async function updateTimezoneAction(
  timezone: string
): Promise<ActionResult<typeof users.$inferSelect>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    // Validate timezone
    const validatedData = timezoneSchema.parse({ timezone });

    // Update user timezone
    const [user] = await db
      .update(users)
      .set({
        timezone: validatedData.timezone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    revalidatePath("/installningar");

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validering misslyckades" };
    }
    console.error("Failed to update timezone:", error);
    return { success: false, error: "Kunde inte spara" };
  }
}
